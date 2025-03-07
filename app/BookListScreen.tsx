import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { initDatabase, getBooks, deleteBook, createBook } from './db';
import { updateBookInAPI, addBookToAPI, fetchBooksFromAPI } from './api';
import { SQLiteDatabase } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définition de la charte graphique
const COLORS = {
  primary: '#8BC34A', // Vert clair principal
  secondary: '#689F38', // Vert foncé pour les accents
  background: '#F5FFF0', // Fond très légèrement teinté de vert
  white: '#FFFFFF',
  text: '#2E3A23', // Texte foncé
  lightText: '#6B7F5C', // Texte secondaire
  error: '#FF5252',
  success: '#4CAF50',
  border: '#E0E0E0',
  card: '#FFFFFF',
  shadow: '#000000',
  price: '#689F38',
  iconGray: '#757575',
  separatorColor: '#EDEDED',
};

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
  const [adminInfo, setAdminInfo] = useState({ name: 'Administrateur' });

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
    const checkAuth = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (!role) {
        navigation.replace('LoginScreen'); // Rediriger si pas connecté
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userRole');
            navigation.replace('LoginScreen');
          } 
        },
      ]
    );
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
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>

        <View style={styles.bookInfo}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.price}>€{item.price.toFixed(2)}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.iconButton, styles.editButton]}
                onPress={() => handleEdit(item)}
              >
                <Icon name="pencil" size={16} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id, item.title)}
              >
                <Icon name="delete" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.welcomeText}>Bonjour,</Text>
          <Text style={styles.adminName}>{adminInfo.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="logout" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="book-multiple" size={24} color={COLORS.primary} />
          <Text style={styles.statCount}>{books.length}</Text>
          <Text style={styles.statLabel}>Livres</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="sync" size={24} color={COLORS.primary} />
          <Text style={styles.statCount}>100%</Text>
          <Text style={styles.statLabel}>Synchronisé</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
      />
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.listHeaderContainer}>
          <Text style={styles.listHeader}>Catalogue de livres</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Icon name="refresh" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Chargement des livres...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="bookshelf" size={60} color={COLORS.lightText} />
                <Text style={styles.emptyText}>Aucun livre disponible</Text>
                <Text style={styles.emptySubText}>Ajoutez votre premier livre en cliquant sur le bouton +</Text>
              </View>
            )
          }
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddBookScreen')}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.lightText,
  },
  adminName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  logoutButton: {
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  listHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  refreshButton: {
    padding: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20', // 20% opacity
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    padding: 12,
  },
  thumbnail: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.separatorColor,
  },
  bookInfo: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.separatorColor,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.price,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.secondary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.primary,
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.lightText,
    maxWidth: '80%',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default BookListScreen;