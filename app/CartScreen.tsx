import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { useCart } from './cartProvider';

export default function Cart({ route, navigation }:{route:any,navigation:any}) {
  const { cart, addToCart, updateQuantity } = useCart();
  const { book } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    if (book) {
      addToCart(book);
    }
  }, [book]);

  const handleConfirm = () => {
    // Effectuez l'action souhaitée (par exemple, navigation.goBack())
    navigation.goBack();
    setModalVisible(false); // Fermer le modal après la confirmation
    
  };

  const handleCancel = () => {
    setModalVisible(false); // Fermer le modal sans faire d'action
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Panier</Text>
      {cart.length === 0 ? (
        <Text style={styles.emptyCart}>Votre panier est vide.</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.author}>{item.author}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.buttonQuantity}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.buttonQuantity}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Text style={styles.buttonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Checkout</Text>
      </TouchableOpacity>

      {/* Modal de confirmation */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Êtes-vous sûr de vouloir passer à la caisse ?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
                <Text style={styles.modalButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#1B5E20', marginBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#C8E6C9', padding: 15, marginBottom: 15, borderRadius: 10 },
  image: { width: 80, height: 120, borderRadius: 10, marginRight: 15 },
  textContainer: { flex: 1, justifyContent: 'center' },
  bookTitle: { fontSize: 18, fontWeight: '600', color: '#2E7D32', marginBottom: 8 },
  author: { fontSize: 14, color: '#388E3C', marginBottom: 6 },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginHorizontal: 10,
  },
  buttonQuantity: {
    backgroundColor: '#66BB6A',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  button: { backgroundColor: '#2E7D32', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  emptyCart: { fontSize: 18, color: '#4CAF50', textAlign: 'center' },
  
  // Styles du modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    width: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10, // Ajoute de l'ombre pour plus de profondeur
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#66BB6A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
