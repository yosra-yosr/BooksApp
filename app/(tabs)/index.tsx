import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, View, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fetchBooksFromAPI } from '../api'; // Assure-toi du bon chemin
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'installer cette dépendance

// Constantes de couleurs pour la charte graphique lightgreen
const COLORS = {
  primary: '#8BC34A',     // Vert clair principal
  secondary: '#689F38',   // Vert plus foncé pour les accents
  tertiary: '#DCEDC8',    // Vert très clair pour les fonds
  text: '#33691E',        // Vert foncé pour le texte
  textLight: '#558B2F',   // Vert moyen pour le texte secondaire
  background: '#F9FBF7',  // Fond très légèrement teinté de vert
  white: '#FFFFFF',
  shadow: '#AACB91',      // Couleur pour les ombres
};

export default function Index({ navigation }: { navigation: any }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (!role) {
        navigation.replace('LoginScreen'); // Rediriger si pas connecté
      }
    };
    checkAuth();
  }, []);
  
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchBooksFromAPI();
        setBooks(data);
      } catch (err) {
        setError("Erreur de récupération des livres");
      } finally {
        setLoading(false);
      }
    };
    
    loadBooks();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userRole');
    navigation.replace('LoginScreen');
  };

  const renderItem = ({ item }: { item: { id: string, title: string, description: string, image: string, price: number } }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Details', { book: item })}
      activeOpacity={0.7}
      style={styles.bookItemContainer}
    >
      <View style={styles.bookItem}>
        <Image source={{ uri: item.image }} style={styles.bookImage} />
        <View style={styles.bookTextContainer}>
          <ThemedText type="title" style={styles.bookTitle}>{item.title}</ThemedText>
          <ThemedText numberOfLines={2} style={styles.bookDescription}>
            {item.description}
          </ThemedText>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>{item.price} €</ThemedText>
            <Ionicons name="chevron-forward" size={16} color={COLORS.secondary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={40} color={COLORS.secondary} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.headerTitle}>Nos Livres</ThemedText>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.footer}>
  <ThemedText style={styles.copyright}>
    © {new Date().getFullYear()} Zoug Yosra. Tous droits réservés.
  </ThemedText>
</View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  bookItemContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bookItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    alignItems: 'center',
  },
  bookImage: {
    width: 70,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  bookTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  bookDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  footer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.tertiary,
  },
  footerLogo: {
    height: 40,
    width: 40,
    tintColor: COLORS.secondary,
  },
});