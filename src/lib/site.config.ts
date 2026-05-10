export const podcast = {
  title: "Feindsender — der 9min-Podcast",
  description: "Schweizer Medienkritik zum Hören. Essays von 9min.ch, vorgelesen vom Autor.",
  author: "9min.ch",
  email: "podcast@9min.ch",
  language: "de-CH",
  category: "News",
  subcategory: "Politics",
  explicit: false,
  cover: "/podcast-cover.jpg",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://9min.ch",
  audioBaseUrl: process.env.NEXT_PUBLIC_AUDIO_BASE_URL ?? "",
}
