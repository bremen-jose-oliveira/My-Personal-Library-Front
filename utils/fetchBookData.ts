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
    const response = await fetch('http://localhost:8080/api/books', {
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
