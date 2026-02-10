export async function GET(req: Request) {
  const encoder = new TextEncoder();

  // Create a Response with a stream
  const stream = new ReadableStream({
    start(controller) {
      // We will push data here later
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
