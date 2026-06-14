export function buildAppleMusicSearchUrl(title: string, artist: string) {
  const term = encodeURIComponent(`${title} ${artist}`.trim()).replace(/%20/g, "%20");
  return `https://music.apple.com/search?term=${term}`;
}
