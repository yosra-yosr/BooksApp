const API_URL = 'http:192.168.8.144:3000/books';

export const fetchBooksFromAPI = async () => {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des livres depuis JSON Server:', error);
    return [];
  }
};

export const addBookToAPI = async (book) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: book.id, // Utilisation de l'ID spécifié
          title: book.title,
          description: book.description,
          price: book.price,
          image: book.image
        }),
      });
  
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du livre sur JSON Server');
      }
  
      return await response.json(); // Retourner le livre ajouté avec le même ID
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };
  
  
  
  // Vérifier si un livre avec le même title existe déjà
  export const checkBookExistsInAPI = async (title) => {
    try {
      const response = await fetch(`${API_URL}?title=${encodeURIComponent(title)}`);
      const books = await response.json();
  
      return books.length > 0 ? books[0] : null; // Retourne le premier livre trouvé
    } catch (error) {
      console.error("Erreur lors de la vérification du livre:", error);
      return null;
    }
  };
  
  export const updateBookInAPI = async (book) => {
    try {
      const response = await fetch(`${API_URL}/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
      });
  
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du livre sur JSON Server');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };
  

  export const deleteBookFromAPI = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  
      console.log("Réponse API suppression:", response.status); // Vérifier le statut
  
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Erreur de suppression (statut ${response.status})`);
      }
  
      console.log(`Livre avec ID ${id} supprimé de l'API`);
    } catch (error) {
      console.error("Erreur lors de la suppression du livre depuis l'API:", error);
      throw error; // Relever l'erreur pour qu'elle remonte
    }
  };
  
  
  
  
  
