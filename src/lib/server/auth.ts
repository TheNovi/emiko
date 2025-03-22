import { env } from "$env/dynamic/private";
import type { Cookies } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { user } from "./db/schema";
if (!env.JWT_SECRET) throw new Error("JWT_SECRET is not set");

const COOKIE_NAME = "emiko";

export enum AuthError {
	MISSING = "All fields are required",
	USER_NOT_EXISTS = "User doesn't exist",
	USER_DELETED = "User deleted",
	WRONG_PASSWORD = "Wrong password",
}

export async function loginUser(event: { cookies: Cookies }, creds: { name?: string; password?: string }): Promise<string | undefined> {
	if (!creds.name || !creds.password) return AuthError.MISSING;

	let u = await db.select({ id: user.id, password: user.password, deletedAt: user.deletedAt }).from(user).where(eq(user.name, creds.name)).get();
	if (!u) return AuthError.USER_NOT_EXISTS;
	if (u.deletedAt) return AuthError.USER_DELETED;
	if (!bcrypt.compareSync(creds.password.trim(), u.password)) return AuthError.WRONG_PASSWORD;

	// await db.update(user).set({lastLogin: new Date()}).where(eq(user.id, u.id));
	console.log("Login", u.id);
	createCookie(event, u);
}

export function createCookie(event: { cookies: Cookies }, user: { id: number }) {
	let token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: "1d", algorithm: "HS256" });
	//`Bearer ${token}`
	event.cookies.set(COOKIE_NAME, token, {
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "strict",
		maxAge: 60 * 60 * 24,
	});
}

export async function logoutUser(event: { cookies: Cookies }) {
	console.log("Logout");
	await event.cookies.delete(COOKIE_NAME, {
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "strict",
		maxAge: 60 * 60 * 24,
	});
}

export async function getUserFromCookie(event: { cookies: Cookies }) {
	const token = event.cookies.get(COOKIE_NAME);
	if (!token) return;
	try {
		//.split(' ')[1]; //Bearer token
		return jwt.verify(token, env.JWT_SECRET, {
			algorithms: ["HS256"],
		}) as unknown as { id: number };
	} catch (error) {
		console.log(error);
	}
}

export function hash(password: string) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}
