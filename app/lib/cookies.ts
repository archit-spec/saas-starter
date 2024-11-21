'use server';

import { cookies } from 'next/headers';

const AUTH_COOKIE = 'auth_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60, // 30 days
  path: '/',
};

export async function setAuthCookie(token: string) {
  const cookieStore = cookies();
  await cookieStore.set(AUTH_COOKIE, token, COOKIE_OPTIONS);
}

export async function getAuthCookie() {
  const cookieStore = cookies();
  return await cookieStore.get(AUTH_COOKIE)?.value;
}

export async function removeAuthCookie() {
  const cookieStore = cookies();
  await cookieStore.delete(AUTH_COOKIE);
}
