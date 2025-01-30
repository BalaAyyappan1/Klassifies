import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken');

  if (refreshToken) {
    return new Response(JSON.stringify({ isAuthenticated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ isAuthenticated: false }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
