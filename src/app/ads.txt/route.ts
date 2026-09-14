export const dynamic = "force-static";

export async function GET() {
  const publisherId = process.env.ADSENSE_PUBLISHER_ID;

  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`
    : "# Set ADSENSE_PUBLISHER_ID in your environment once your Google AdSense account is approved.\n# Example: google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
