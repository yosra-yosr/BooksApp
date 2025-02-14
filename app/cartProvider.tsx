import React, { createContext, useContext, useState } from 'react';
// Définition du type de livre
interface Book {
  id: string;
  title: string;
  author: string;
  image: any;
  quantity: number;
}
// Définition du type du contexte
interface CartContextType {
  cart: Book[];
  addToCart: (book: Book) => void;
  updateQuantity: (bookId: string, change: number) => void;
}
// Création du contexte
const CartContext = createContext<CartContextType | undefined>(undefined);
// Provider du panier
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Book[]>([]);
  // Ajouter un livre au panier
  const addToCart = (book: Book) => {
    setCart((prevCart) => {
      const existingBookIndex = prevCart.findIndex((item) => item.id === book.id);
      if (existingBookIndex !== -1) {
        // Si déjà dans le panier, on incrémente la quantité
        return prevCart.map((item, index) =>
          index === existingBookIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Sinon, on ajoute le livre avec une quantité initiale de 1
        return [...prevCart, { ...book, quantity: 1 }];
      }
    });
  };
  // Mettre à jour la quantité d'un livre
  const updateQuantity = (bookId: string, change: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === bookId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
        )
    );
  };
  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
// Hook personnalisé pour utiliser le contexte
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider");
  }
  return context;
};