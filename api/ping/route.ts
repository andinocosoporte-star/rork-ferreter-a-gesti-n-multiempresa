export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok', runtime: 'edge' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
