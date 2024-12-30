import { db } from '$lib/server/db';
import { bobImage } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
// import { writeFile } from 'fs/promises';
import sharp from 'sharp';

const resize = (f: sharp.Sharp, path: string, width: number, height: number) =>
	f.clone().resize({ width, height, fit: 'inside' }).toFile(`./data/bob/resized/${path}`);

export const POST: RequestHandler = async ({ request }) => {
	// await new Promise((resolve) => { setTimeout(resolve, 5000); });
	const formData = await request.formData();
	if (!formData) return new Response();
	const files = formData.getAll('files') as File[];

	const types = new Map<string, keyof sharp.FormatEnum>([
		['image/png', 'png'],
		['image/jpeg', 'jpg'],
		['image/gif', 'gif'],
	]);

	for (const file of files) {
		//TODO Video
		//TODO Logger
		//TODO Error handling
		// Checks
		if (!file || !file.size) continue;
		if (file.size > 50 * 1000 * 1000) {
			//50 MB (yes its in bytes)
			console.log('File too big', file.name, file.size);
			continue;
		}
		const ext = types.get(file.type);
		if (!ext) {
			console.log('Unsupported file type', file.name, file.type);
			continue;
		}

		// Create row in db
		// TODO UserId
		let r = await db
			.insert(bobImage)
			.values({
				userId: 1,
				path: '',
				takenAt: new Date(file.lastModified), //Most likely current date
				type: file.type,
				size: file.size,
			})
			.returning({ id: bobImage.id });

		// Write file to disk
		//TODO md5
		const path = `${r[0].id}.${ext}`;
		let f = sharp(await file.arrayBuffer())
			.metadata((err, m) => {
				if (err && err.name) {
					console.log('Metadata file error', file.name, err.cause, err.name, err.message);
					// continue;
				}
				//* https://www.npmjs.com/package/exifreader (most used)
				//* https://www.npmjs.com/package/exif-reader (used by sharp tests https://github.com/lovell/sharp/blob/main/test/unit/metadata.js#L46-L49)
				// console.log(m);
			})
			.toFormat(ext as any);
		Promise.all([
			resize(f, 'T-' + path, 120, 80), //TODO Test sizes
			resize(f, 'P-' + path, 640, 480),
			//! Don't make this metadata public (use only images above)
			f.withMetadata().toFile(`./data/bob/org/${path}`), //TODO Still maybe resize this
		]).then(() => console.log(file.name, '->', path)); //? Await
		// writeFile(`./data/bob/${path}`, Buffer.from(await file.arrayBuffer())).then(() => {
		// 	console.log(`${progress++}/${t} ${file.name}`);
		// }); //? Await

		// Update path in db
		await db.update(bobImage).set({ path }).where(eq(bobImage.id, r[0].id));
	}

	return new Response();
};
