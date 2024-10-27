// api.ts
export async function fetchBooksFromGoogle(query: string) {
  const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(googleBooksApiUrl);
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch books from Google API', error);
    return [];
  }
}

export async function addBookToServer(bookData: any) {
  try {
    const response = await fetch('hhttp://192.168.2.41:8080/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to add book to server', error);
    return { success: false };
  }
}

export const fetchCoverImage = async (title: string, author: string): Promise<string | null> => {
  const query = `${title} ${author}`.replace(/\s+/g, '+');
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
  const fallbackCover = `https://cdn-icons-png.flaticon.com/512/7340/7340665.png`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || fallbackCover;
  } catch (error) {
    console.error('Failed to fetch cover image:', error);
    return fallbackCover;
  }
};