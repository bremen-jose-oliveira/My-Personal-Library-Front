// api.ts
import { apiClient } from "@/utils/apiClient";

export async function fetchBooksFromGoogle(query: string) {
  const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}`;
  try {
    const response = await fetch(googleBooksApiUrl);
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Failed to fetch books from Google API", error);
    return [];
  }
}

export async function addBookToServer(bookData: any) {
  try {
    const response = await apiClient.post(
      `${process.env.EXPO_PUBLIC_API_URL}/api/books`,
      bookData
    );
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add book to server", error);
    return { success: false };
  }
}

/** Open Library cover by ISBN - no Google quota. */
export function getOpenLibraryCoverUrl(isbn: string): string {
  const clean = (isbn || "").replace(/\D/g, "").trim();
  if (!clean) return "";
  return `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg`;
}

export const fetchCoverImage = async (
  title: string,
  author: string,
  isbn?: string | null
): Promise<string | null> => {
  const fallbackCover = `https://cdn-icons-png.flaticon.com/512/7340/7340665.png`;

  if (isbn && isbn !== "N/A") {
    const openLibraryUrl = getOpenLibraryCoverUrl(isbn);
    if (openLibraryUrl) return openLibraryUrl;
  }

  const query = `${title} ${author}`.replace(/\s+/g, "+");
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (response.status === 429) return fallbackCover;
    if (!response.ok) return fallbackCover;

    const data = await response.json();

    // Simple: return thumbnail or fallback - always returns a cover
    const coverUrl = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;

    if (coverUrl) {
      // Ensure HTTPS
      const httpsUrl = coverUrl.startsWith("http://")
        ? coverUrl.replace("http://", "https://")
        : coverUrl;
      return httpsUrl;
    }
    return fallbackCover;
  } catch (error: any) {
    console.error(
      `❌ Failed to fetch cover image for "${title}":`,
      error.message || error
    );
    // Always return fallback - ensures all books have a cover
    return fallbackCover;
  }
};
