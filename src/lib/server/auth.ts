import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { user } from './db/schema';

const COOKIE_NAME = 'emiko';

export async function loginUser(
	event: { cookies: Cookies },
	creds: { name?: string; password?: string }
): Promise<string | undefined> {
	if (!creds.name || !creds.password) return 'Some field is missing';

	let u = await db
		.select({ id: user.id, password: user.password, deletedAt: user.deletedAt })
		.from(user)
		.where(eq(user.name, creds.name))
		.get();
	//TODO Enum
	if (!u) return `User doesn't exist`;
	if (u.deletedAt) return `User deleted`;
	if (!bcrypt.compareSync(creds.password.trim(), u.password)) return `Wrong password`;

	// await db.update(user).set({lastLogin: new Date()}).where(eq(user.id, u.id));
	console.log('Login', u.id);
	createCookie(event, u);
}

export function createCookie(event: { cookies: Cookies }, user: { id: number }) {
	let token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '1d', algorithm: 'HS256' });
	//`Bearer ${token}`
	event.cookies.set(COOKIE_NAME, token, {
		path: '/',
		secure: true,
		httpOnly: true,
		sameSite: 'strict',
		maxAge: 60 * 60 * 24,
	});
}

export async function logoutUser(event: { cookies: Cookies }) {
	console.log('Logout');
	await event.cookies.delete(COOKIE_NAME, {
		path: '/',
		secure: true,
		httpOnly: true,
		sameSite: 'strict',
		maxAge: 60 * 60 * 24,
	});
}

export async function getUserFromCookie(event: { cookies: Cookies }) {
	const token = event.cookies.get(COOKIE_NAME);
	if (!token) return;
	try {
		//.split(' ')[1]; //Bearer token
		return jwt.verify(token, env.JWT_SECRET, {
			algorithms: ['HS256'],
		}) as unknown as { id: number }; //TODO Better type
	} catch (error) {
		console.log(error);
	}
}

export function hash(password: string) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}
