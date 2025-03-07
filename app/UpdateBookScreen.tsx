import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { initDatabase, updateBook } from './db';

const UpdateBookScreen = ({ navigation, route }:{ route: any, navigation: any }) => {
  const { book } = route.params || {};

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur : Le livre n'a pas été trouvé.</Text>
      </View>
    );
  }

  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description);
  const [price, setPrice] = useState(book.price.toString());
  const [image, setImage] = useState(book.image);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateBook = async () => {
    setError(null);
    setIsLoading(true);

    if (!title.trim()) {
      setError('Le titre est requis');
      setIsLoading(false);
      return;
    }
    if (!description.trim()) {
      setError('La description est requise');
      setIsLoading(false);
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      setError('Le prix doit être un nombre valide');
      setIsLoading(false);
      return;
    }
    if (!image.trim()) {
      setError("L'URL de l'image est requise");
      setIsLoading(false);
      return;
    }

    try {
      const db = await initDatabase();
      const updatedBook = {
        id: book.id,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        image: image.trim(),
      };

      await updateBook(db, updatedBook);
      Alert.alert('Succès', 'Le livre a été mis à jour avec succès.');
      navigation.navigate('BookListScreen', { refresh: true });
    } catch (error) {
      setError(`Erreur lors de la mise à jour du livre : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le livre</Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={20} color="#ff4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Entrez le titre du livre"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Entrez la description du livre"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="Entrez le prix"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de l'image</Text>
            <TextInput
              style={styles.input}
              value={image}
              onChangeText={setImage}
              placeholder="Entrez l'URL de l'image"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateBook}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="content-save" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Mettre à jour</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff4444',
    marginLeft: 10,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateBookScreen;
