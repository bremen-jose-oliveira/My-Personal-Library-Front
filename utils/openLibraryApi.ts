/**
 * Open Library API – search and lookup with User-Agent for 3 req/s.
 * No daily quota; only per-second rate limit.
 */

const OPEN_LIBRARY_BASE = "https://openlibrary.org";
const USER_AGENT = "MyPersonalLibrary (my.personal.lib@proton.me)";

function headers(): HeadersInit {
  return {
    Accept: "application/json",
    "User-Agent": USER_AGENT,
  };
}

/** Open Library search doc (work-level). */
export interface OpenLibraryDoc {
  key: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  edition_count?: number;
  [key: string]: unknown;
}

/** Unified book item shape used by AddBookForm (Google-like volumeInfo). */
export interface UnifiedBookItem {
  id: string;
  source: "openlibrary" | "google";
  volumeInfo: {
    title: string;
    authors?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string; small?: string; smallThumbnail?: string };
    publishedDate?: string;
    description?: string | null;
    publisher?: string;
  };
}

function mapOpenLibraryDocToUnified(doc: OpenLibraryDoc, index: number): UnifiedBookItem {
  const id = doc.key?.replace(/^\//, "") || `ol-${doc.cover_i ?? index}`;
  const authorList = doc.author_name ?? [];
  const isbn = Array.isArray(doc.isbn) ? doc.isbn[0] : undefined;
  const coverUrl =
    doc.cover_i != null
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : undefined;

  return {
    id,
    source: "openlibrary",
    volumeInfo: {
      title: doc.title ?? "Unknown",
      authors: authorList.length ? authorList : undefined,
      industryIdentifiers: isbn
        ? [{ type: isbn.length === 13 ? "ISBN_13" : "ISBN_10", identifier: isbn }]
        : undefined,
      imageLinks: coverUrl ? { thumbnail: coverUrl, small: coverUrl, smallThumbnail: coverUrl } : undefined,
      publishedDate: doc.first_publish_year != null ? String(doc.first_publish_year) : undefined,
      description: null,
      publisher: undefined,
    },
  };
}

/**
 * Search Open Library. Returns unified book items (same shape as Google for the UI).
 */
export async function searchOpenLibrary(
  query: string,
  options: { page?: number; limit?: number } = {}
): Promise<{ items: UnifiedBookItem[]; numFound: number }> {
  const { page = 1, limit = 20 } = options;
  const q = query.trim();
  if (!q) return { items: [], numFound: 0 };

  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    q,
    limit: String(limit),
    offset: String(offset),
    fields: "key,title,author_name,first_publish_year,cover_i,isbn",
  });
  const url = `${OPEN_LIBRARY_BASE}/search.json?${params.toString()}`;

  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return { items: [], numFound: 0 };
    const data = await res.json();
    const docs: OpenLibraryDoc[] = Array.isArray(data.docs) ? data.docs : [];
    const numFound = typeof data.num_found === "number" ? data.num_found : 0;
    const items = docs
      .map((doc, i) => mapOpenLibraryDocToUnified(doc, i))
      .filter((item) => (item.volumeInfo.industryIdentifiers?.length ?? 0) > 0);
    return { items, numFound };
  } catch (e) {
    console.warn("Open Library search failed:", e);
    return { items: [], numFound: 0 };
  }
}

/**
 * Fetch a single book by ISBN from Open Library. Returns one unified item or null.
 * Uses edition endpoint; author names may be "Unknown" unless we fetch author keys (we skip extra requests).
 */
export async function fetchOpenLibraryByIsbn(isbn: string): Promise<UnifiedBookItem | null> {
  const clean = (isbn || "").replace(/\D/g, "").trim();
  if (!clean) return null;

  const url = `${OPEN_LIBRARY_BASE}/isbn/${clean}.json`;
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return null;
    const edition = await res.json();
    const title = edition.title ?? "Unknown";
    const coverId = edition.covers?.[0];
    const coverUrl =
      coverId != null ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined;

    const item: UnifiedBookItem = {
      id: edition.key?.replace(/^\//, "") ?? `isbn-${clean}`,
      source: "openlibrary",
      volumeInfo: {
        title,
        authors: undefined,
        industryIdentifiers: [{ type: clean.length === 13 ? "ISBN_13" : "ISBN_10", identifier: clean }],
        imageLinks: coverUrl ? { thumbnail: coverUrl, small: coverUrl, smallThumbnail: coverUrl } : undefined,
        publishedDate: edition.publish_date ?? undefined,
        description: edition.description ?? null,
        publisher: edition.publishers?.[0] ?? undefined,
      },
    };
    return item;
  } catch (e) {
    console.warn("Open Library ISBN lookup failed:", e);
    return null;
  }
}
