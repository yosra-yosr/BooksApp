// import * as SQLite from 'expo-sqlite';

// // Initialisation de la base de données
// export async function initDatabase() {
//   try {
//     const db = await SQLite.openDatabaseAsync('books.db');
    
//     // Exécuter la commande PRAGMA pour configurer le mode journal et créer la table
//     await db.execAsync(`
//       PRAGMA journal_mode = WAL;
//       CREATE TABLE IF NOT EXISTS book (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         title TEXT NOT NULL,
//         description TEXT,
//         price REAL, 
//         image TEXT
//       );
//     `);
    
//     console.log("La table 'book' est prête.");
//     return db;
//   } catch (error) {
//     console.error("Erreur lors de l'initialisation de la base de données :", error);
//     throw new Error("Impossible d'initialiser la base de données");
//   }
// }

// // Méthode pour ajouter un nouveau livre
// export async function createBook(db, { title, description, price, image }) {
//     console.log('Données reçues dans createBook:', { title,description,price,image});
  
//     if (!title || !description || !price || !image) {
//       console.error('Erreur: Des données sont manquantes dans createBook');
//       throw new Error('Les données sont incomplètes');
//     }
  
//     try {
//       const result = await db.execAsync(
//         `INSERT INTO book (title, description, price, image) VALUES (?, ?, ?, ?);`,
//         [title, description, price, image]
//       );
//       console.log("Livre ajouté avec succès !", result);
//       console.log(result)
//       return result;
//     } catch (error) {
//       console.error("Erreur lors de l'ajout du livre:", error);
//       throw new Error("Erreur lors de l'ajout du livre");
//     }
//   }
  
  

// // Méthode pour récupérer tous les livres
// export async function readBooks(db) {
//   try {
//     const result = await db.execAsync(`SELECT * FROM books;`);
//     return result[0].rows._array;
//   } catch (error) {
//     throw new Error('Erreur lors de la récupération des livres');
//   }
// }

// // Méthode pour mettre à jour un livre
// export async function updateBook(db, { id, title, description, price, image }) {
//   try {
//     const result = await db.execAsync(
//       `UPDATE books SET title = ?, description = ?, price = ?, image = ? WHERE id = ?;`,
//       [title, description, price, image, id]
//     );
//     return result;
//   } catch (error) {
//     throw new Error('Erreur lors de la mise à jour du livre');
//   }
// }

// // Méthode pour supprimer un livre
// export async function deleteBook(db, id) {
//   try {
//     const result = await db.execAsync(
//       `DELETE FROM books WHERE id = ?;`,
//       [id]
//     );
//     return result;
//   } catch (error) {
//     throw new Error('Erreur lors de la suppression du livre');
//   }
// }

import {addBookToAPI,updateBookInAPI,deleteBookFromAPI,checkBookExistsInAPI,fetchBooksFromAPI} from './api'
import * as SQLite from 'expo-sqlite';
// Initialisation de la base de données
export async function initDatabase() {
  try {
    const db = await SQLite.openDatabaseAsync('books.db');
    // Exécuter la commande PRAGMA pour configurer le mode journal et créer la table
    await db.execAsync(`
       PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL,
    image TEXT
  );
    `);
    console.log("La table 'book' est prête.");
    return db;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données :", error);
    throw new Error("Impossible d'initialiser la base de données");
  }
}
// Méthode pour ajouter un nouveau livre
export async function createBook(db, { id, title, description, price, image }) {
  try {
    // Vérifier si le livre existe déjà en local
    const existingBook = await db.getFirstAsync(`SELECT * FROM book WHERE title = ?;`, [title]);
    if (existingBook) {
      console.log("Le livre existe déjà en local.");
      return existingBook;
    }

    // Vérifier si le livre existe dans l'API JSON Server
    const bookFromAPI = await checkBookExistsInAPI(title);

    if (bookFromAPI) {
      console.log("Le livre existe déjà sur JSON Server.");
      return bookFromAPI;
    }

    // Ajouter le livre en local (SQLite)
    const result = await db.runAsync(
      `INSERT INTO book (id, title, description, price, image) VALUES (?, ?, ?, ?, ?);`,
      [id, title, description, price, image] // Assurez-vous que l'ID est bien passé ici
    );

    // Ajouter aussi dans JSON Server avec l'ID spécifié
    const newBookFromAPI = await addBookToAPI({ id, title, description, price, image });

    return newBookFromAPI;
  } catch (error) {
    console.error("Erreur lors de l'ajout du livre:", error);
    throw new Error("Erreur lors de l'ajout du livre");
  }
}


// Méthode pour récupérer tous les livres
export async function getBooks(db) {
  try {
    // Récupérer les livres depuis l'API
    const booksFromAPI = await fetchBooksFromAPI();

    // Récupérer les livres depuis SQLite
    const booksFromDB = await db.getAllAsync(`SELECT * FROM book;`);

    // Fusionner les deux listes en supprimant les doublons (basé sur le title)
    const uniqueBooks = {};
    [...booksFromAPI, ...booksFromDB].forEach(book => {
      uniqueBooks[book.title] = book; // Évite les doublons
    });

    return Object.values(uniqueBooks);
  } catch (error) {
    console.error("Erreur lors de la récupération des livres:", error);
    return [];
  }
}
// Méthode pour mettre à jour un livre
export async function updateBook(db, book) {
  try {
    await db.runAsync(
      `UPDATE book SET title = ?, description = ?, price = ?, image = ? WHERE id = ?;`,
      [book.title, book.description, book.price, book.image, book.id]
    );

    await updateBookInAPI(book);
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour du livre');
  }
}

// Méthode pour supprimer un livre
export async function deleteBook(db, id) {
  try {
    console.log(`Suppression SQLite du livre ID=${id}`);
    
    await db.runAsync(`DELETE FROM book WHERE id = ?;`, [id]);

    await deleteBookFromAPI(id);
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    throw new Error('Erreur lors de la suppression du livre');
  }
}


