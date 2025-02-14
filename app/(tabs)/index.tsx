import React from 'react';
import { FlatList, Image, StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
// import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';

const books = [
  {
    id: '1',
    title: 'AWS',
    description: 'Master Amazon Web Services (AWS) and learn to manage cloud infrastructure, deploy scalable applications, and secure data in the cloud. This book is perfect for beginners and intermediate developers looking to dive into cloud computing.',
    image: require('@/assets/images/aws.jpg'),
    price: 29.99,
  },
  {
    id: '2',
    title: 'React and React Native',
    description: 'Dive into the world of front-end development with React and React Native. Learn to build modern, dynamic web and mobile applications using the most popular JavaScript library and framework. Ideal for developers who want to create cross-platform apps.',
    image: require('@/assets/images/reactBook.jpg'),
    price: 39.99,
  },
  {
    id: '3',
    title: 'Node.js for Beginners',
    description: 'An introduction to Node.js for backend development. Learn how to build scalable and efficient server-side applications with JavaScript. Perfect for developers looking to extend their skills to backend programming.',
    image: { uri: 'https://picsum.photos/200/300' },
    price: 25.99,
  },
  {
    id: '4',
    title: 'JavaScript Essentials',
    description: 'Get started with JavaScript and learn the essentials for building interactive websites and applications. This book covers the basics of JavaScript, including syntax, data structures, and common algorithms, making it ideal for beginners.',
    image: { uri: 'https://picsum.photos/200/200' },
    price: 19.99,
  },
  {
    id: '5',
    title: 'The React Handbook',
    description: 'The complete guide to mastering React. From hooks to context and routing, this book will take you through all the essential features of React and teach you how to build high-performance web applications. A must-read for any serious front-end developer.',
    image: { uri: 'https://picsum.photos/150/150' },
    price: 45.99,
  },
  {
    id: '6',
    title: 'Database Design',
    description: 'Learn how to design and implement efficient database architectures. This book covers database normalization, relationships, indexing, and query optimization, providing all the tools necessary to build scalable and reliable databases.',
    image: { uri: 'https://picsum.photos/100/100' },
    price: 35.99,
  },
];


// Index.tsx
export default function Index({ navigation }: { navigation: any }) {
  const renderItem = ({ item }: { item: { title: string, description: string, image: any, price: number } }) => (
    <Pressable onPress={() => navigation.navigate('Details', { book: item })}>
      <View style={styles.bookItem}>
        <Image source={item.image} style={styles.bookImage} />
        <View style={styles.bookTextContainer}>
          <ThemedText type="title" style={styles.bookTitle}>{item.title}</ThemedText>
          <ThemedText numberOfLines={2} style={styles.bookDescription}>
            {item.description}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );

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
          keyExtractor={(item) => item.id}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}



const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
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
