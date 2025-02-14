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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { initDatabase, createBook } from './db';

interface AddBookScreenProps {
  navigation: any;
  route: any;
}

const AddBookScreen: React.FC<AddBookScreenProps> = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddBook = async () => {
    setError(null);
    setIsLoading(true);

    // Validation des entrées
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
      setError('L\'URL de l\'image est requise');
      setIsLoading(false);
      return;
    }

    const priceNumber = parseFloat(price);

    try {
      const db = await initDatabase();
      const newBook = {
        title: title.trim(),
        description: description.trim(),
        price: priceNumber,
        image: image.trim(), // Assurez-vous que le nom correspond à votre schéma
      };

      await createBook(db, newBook);
      
      // Navigation avec paramètre de rafraîchissement
      navigation.navigate('BookListScreen', { refresh: true });
    } catch (error: any) {
      setError(`Erreur lors de l'ajout du livre: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header avec bouton retour */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ajouter un livre</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#ff4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez le titre du livre"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Entrez la description du livre"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez le prix"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de l'image</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez l'URL de l'image"
              value={image}
              onChangeText={setImage}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddBook}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="plus" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Ajouter le livre</Text>
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
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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

export default AddBookScreen;