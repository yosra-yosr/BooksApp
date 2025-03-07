import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { initDatabase, getBooks, deleteBook, createBook } from './db';
import { updateBookInAPI,addBookToAPI,fetchBooksFromAPI } from './api';
import { SQLiteDatabase } from 'expo-sqlite';
interface Book {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
}

interface BookListScreenProps {
  navigation: any;
  route: any;
}

const BookListScreen: React.FC<BookListScreenProps> = ({ navigation, route }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);



  const syncBooks = async (sqliteBooks: Book[], apiBooks: Book[], db: SQLiteDatabase) => {
    try {
      const apiBookTitles = new Set(apiBooks.map((book) => book.title));
      const localBookTitles = new Set(sqliteBooks.map((book) => book.title));
  
      // Ajouter les livres locaux absents sur JSON Server
      for (const book of sqliteBooks) {
        if (!apiBookTitles.has(book.title)) {
          const addedBook = await addBookToAPI(book);
          
          // Mise à jour locale avec l'ID correct de JSON Server
          if (addedBook && addedBook.id) {
            await db.runAsync(`UPDATE book SET id = ? WHERE title = ?;`, [addedBook.id, book.title]);
          }
        }
      }
  
      // Ajouter les livres de l'API absents en local
      for (const book of apiBooks) {
        if (!localBookTitles.has(book.title)) {
          await createBook(db, book);
        }
      }
  
      // Mettre à jour les livres si différences (ex: description, prix, image)
      for (const localBook of sqliteBooks) {
        const matchingApiBook = apiBooks.find((apiBook) => apiBook.title === localBook.title);
        if (matchingApiBook && (
          localBook.description !== matchingApiBook.description ||
          localBook.price !== matchingApiBook.price ||
          localBook.image !== matchingApiBook.image
        )) {
          await updateBookInAPI(localBook);
        }
      }
  
      console.log("Synchronisation terminée !");
    } catch (error) {
      console.error("Erreur lors de la synchronisation :", error);
    }
  };
  
  


  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const db = await initDatabase();
  
      // Récupérer les livres depuis SQLite et JSON Server
      const sqliteBooks = await getBooks(db);
      const apiBooks = await fetchBooksFromAPI();
  
      // Synchroniser les données
      await syncBooks(sqliteBooks, apiBooks, db);
  
      // Recharger après la synchronisation
      const updatedBooks = await getBooks(db);
      setBooks(updatedBooks);
  
      setError(null);
    } catch (error) {
      setError(`Erreur lors de la récupération des livres: ${error}`);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  
  
  
  

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.refresh) {
        fetchBooks();
        navigation.setParams({ refresh: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route]);

  const handleEdit = (book: Object) => {
    navigation.navigate('UpdateBookScreen', { book });
    
  };

  const handleDelete = async (bookId: number, bookTitle: string) => { 
    console.log(`Tentative de suppression: ID=${bookId}, Titre="${bookTitle}"`);
  
    Alert.alert(
      'Confirmation de suppression',
      `Êtes-vous sûr de vouloir supprimer "${bookTitle}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await initDatabase();
              await deleteBook(db, bookId); // Suppression SQLite
              fetchBooks(); // Rafraîchir la liste
            } catch (error: any) {
              setError(`Erreur lors de la suppression: ${error.message}`);
              console.error('Erreur de suppression:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchBooks();
  }, []);

  const renderItem = ({ item }: { item: Book }) => (
    <View style={styles.card}>
      <View style={styles.adminActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleEdit(item)}
        >
          <Icon name="pencil" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Icon name="delete" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.contentContainer}
        onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>

        <View style={styles.bookInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.price}>€{item.price.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Liste des Livres</Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2ecc71" />
            </View>
          ) : (
            <Text style={styles.emptyText}>Aucun livre disponible</Text>
          )
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddBookScreen')}
      >
        <Icon name="plus" size={30} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  bookInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ecc71',
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2ecc71',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default BookListScreen;