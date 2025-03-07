import React from 'react';
import { View, Image, StyleSheet, Text, Button, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function Details({ route, navigation }: { route: any, navigation: any }){
  const { book } = route.params; // Récupérer les informations du livre passé via navigation

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailsContainer}>
        <Image
  source={typeof book.image === 'string' ? { uri: book.image } : book.image}
  style={styles.bookImage}
  resizeMode="contain"
/>
        {/* <Image source={book.image} style={styles.bookImage} /> */}
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.description}>{book.description}</Text>
        <Text style={styles.price}>{book.price} TND</Text>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => {
            // Rediriger vers l'écran Cart avec l'objet livre
            navigation.navigate('Cart', { book: book, quantity: 1 });
          }}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  bookImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
    marginBottom: 20,
  },
  detailsContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e60000',
    marginBottom: 20,
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    elevation: 5,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#888', // Gris clair pour un effet discret
    textAlign: 'center',
    marginTop: 10,
  },
  
});
