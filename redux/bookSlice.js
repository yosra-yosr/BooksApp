import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Définition du point d'accès JSON Server
const API_URL = 'http:192.168.129.98:3000/books';
// :grand_cercle_vert: Récupérer les livres depuis JSON Server
export const fetchBooks = createAsyncThunk('books/fetchBooks', async () => {
  const response = await fetch(API_URL);
  return await response.json();
});
// :grand_cercle_vert: Ajouter un livre
export const addBook = createAsyncThunk('books/addBook', async (newBook) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newBook),
  });
  return await response.json();
});
// :grand_cercle_vert: Mettre à jour un livre
export const updateBook = createAsyncThunk('books/updateBook', async (updatedBook) => {
  const response = await fetch(`${API_URL}/${updatedBook.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedBook),
  });
  return await response.json();
});
// :grand_cercle_vert: Supprimer un livre
export const deleteBook = createAsyncThunk('books/deleteBook', async (id) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return id;
});
const booksSlice = createSlice({
  name: 'books',
  initialState: {
    books: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.push(action.payload);
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const index = state.books.findIndex(book => book.id == action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter(book => book.id != action.payload);
      });
  },
});
export default booksSlice.reducer;