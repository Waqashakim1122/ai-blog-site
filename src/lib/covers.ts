const COVER_COUNT = 15;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function coverImageForSlug(slug: string): string {
  const index = (hashString(slug) % COVER_COUNT) + 1;
  return `/images/covers/cover-${index}.svg`;
}
