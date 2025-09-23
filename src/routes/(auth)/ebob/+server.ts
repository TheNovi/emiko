import { db } from "$lib/server/db";
import { bobImage } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";
// import { writeFile } from 'fs/promises';
import { building } from "$app/environment";
import { env } from "$env/dynamic/private";
import { error } from "@sveltejs/kit";
import { join as pJoin } from "path";
import sharp from "sharp";
if (!building && !env.DATA_PATH) throw new Error("DATA_PATH is not set");

const resize = (f: sharp.Sharp, path: string, width: number, height: number, folder: string = "resized") =>
	f
		.clone()
		.resize({ width, height, fit: "inside", withoutEnlargement: true })
		.toFile(pJoin(env.DATA_PATH, "bob", folder, path));

//File upload
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !locals.user.id) return error(403, "No user found");

	// await new Promise((resolve) => { setTimeout(resolve, 5000); });
	const formData = await request.formData();
	if (!formData) return new Response();
	const files = formData.getAll("files") as File[];

	const types = new Map<string, keyof sharp.FormatEnum>([
		["image/png", "png"],
		["image/jpeg", "jpg"],
		["image/gif", "gif"],
	]);

	for (const file of files) {
		//TODO Logger
		//TODO Better Error handling
		//TODO Video
		// Checks //TODO Are these checks enough? Can this be changed in file object?
		if (!file || !file.size) continue;
		if (file.size > 50 * 1000 * 1000) {
			//50 MB (yes its in bytes)
			//? Is this necessary? Photo is resized anyway.
			console.error("File too big", file.name, file.size);
			continue;
			// return error(413, file.name);
		}
		const ext = types.get(file.type);
		if (!ext) {
			console.error("Unsupported file type", file.name, file.type);
			continue;
			// return error(415, file.name);
		}

		// Make sharp file object
		let f = sharp(await file.arrayBuffer())
			// .metadata((err, m) => {
			// 	if (err && err.name) {
			// 		console.log('Metadata file error', file.name, err.cause, err.name, err.message);
			// 	}
			// 	//* https://www.npmjs.com/package/exifreader (most used)
			// 	//* https://www.npmjs.com/package/exif-reader (used by sharp tests https://github.com/lovell/sharp/blob/main/test/unit/metadata.js#L46-L49)
			// 	// console.log(m);
			// })
			// .toFormat(ext as any);
			.toFormat("webp");

		// Check if file is really a image (or something what sharp can process)
		try {
			await f.stats();
		} catch (e) {
			console.error(e);
			continue;
			// return error(415, file.name);
		}

		// Create row in db
		let r = await db
			.insert(bobImage)
			.values({
				userId: locals.user.id,
				path: "",
				takenAt: new Date(file.lastModified), //Most likely current date
				type: file.type,
				size: file.size,
			})
			.returning({ id: bobImage.id });

		// const path = `${r[0].id.toString(16)}.${ext}`;
		const path = `${r[0].id.toString(16)}.webp`;
		await Promise.all([
			resize(f, "T-" + path, 120, 80), //TODO Find best sizes for full HD, notebook and mobile (idk, good luck).
			resize(f, "P-" + path, 640, 640), //TODO Resize images on request
			resize(f, path, 1920, 1080, "org"),
			// f.toFile(pJoin(env.DATA_PATH, 'bob', 'org', path)),
		]).then(() => console.log(file.name, "->", path));
		// writeFile(`${DATA_FOLDER}/bob/${path}`, Buffer.from(await file.arrayBuffer()));

		// Update path in db
		await db.update(bobImage).set({ path }).where(eq(bobImage.id, r[0].id));
	}

	return new Response();
};
