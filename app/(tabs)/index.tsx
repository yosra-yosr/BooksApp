import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { fetchBooksFromAPI } from '../api'; // Assure-toi du bon chemin

export default function Index({ navigation }: { navigation: any }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const renderItem = ({ item }: { item: { id:string,title: string, description: string, image: string, price: number } }) => (
    <Pressable onPress={() => navigation.navigate('Details', { book: item })}>
      <View style={styles.bookItem}>
        <Image source={{ uri: item.image }} style={styles.bookImage} />
        <View style={styles.bookTextContainer}>
          <ThemedText type="title" style={styles.bookTitle}>{item.title}</ThemedText>
          <ThemedText numberOfLines={2} style={styles.bookDescription}>
            {item.description}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <ThemedText >{error}</ThemedText>;
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.reactLogo} />}
    >
      <ThemedView style={styles.listContainer}>
        <ThemedText type="subtitle">Our Books</ThemedText>
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    gap: 8,
    marginBottom: 8,
  },
  bookItem: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: 'center',
  },
  bookImage: {
    width: 60,
    height: 90,
    marginRight: 15,
    borderRadius: 8,
  },
  bookTextContainer: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookDescription: {
    fontSize: 14,
    color: '#555',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
