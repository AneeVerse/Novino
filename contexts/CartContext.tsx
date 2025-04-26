"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for cart items
export interface CartItem {
  id: string | number;
  name: string;
  price: string | number;
  image: string;
  quantity: number;
  variant?: string;
}

// Define types for cart context
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string | number, variant?: string) => void;
  updateQuantity: (itemId: string | number, quantity: number, variant?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartCount: () => 0,
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Initialize cart state from localStorage (if available)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('novinoCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('novinoCart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      // Check if item already exists in cart (with same id and variant if applicable)
      const existingItemIndex = prevCart.findIndex(
        cartItem => 
          cartItem.id === item.id && 
          ((!cartItem.variant && !item.variant) || cartItem.variant === item.variant)
      );

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, item];
      }
    });
    
    // Open cart drawer when item is added
    setIsCartOpen(true);
  };

  // Remove item from cart
  const removeFromCart = (itemId: string | number, variant?: string) => {
    setCart(prevCart => 
      prevCart.filter(item => 
        item.id !== itemId || 
        (variant && item.variant !== variant)
      )
    );
  };

  // Update item quantity
  const updateQuantity = (itemId: string | number, quantity: number, variant?: string) => {
    setCart(prevCart => 
      prevCart.map(item => 
        (item.id === itemId && ((!variant && !item.variant) || item.variant === variant))
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate cart total price
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      // Convert price to number if it's a string
      const itemPrice = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
        : item.price;
      
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  // Get total number of items in cart
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };
  
  // Open cart drawer
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  // Close cart drawer
  const closeCart = () => {
    setIsCartOpen(false);
  };

  // Context provider value
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isCartOpen,
    openCart,
    closeCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 