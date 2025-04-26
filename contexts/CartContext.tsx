"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Define types for cart items
export interface CartItem {
  id: string | number;
  name: string;
  price: string | number;
  image: string;
  quantity: number;
  variant?: string;
  addedAt?: Date;
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
  isLoading: boolean;
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
  isLoading: false,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Initialize cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && session?.user;

  // Load cart on mount and when authentication status changes
  useEffect(() => {
    async function loadCart() {
      setIsLoading(true);
      try {
        if (isLoggedIn) {
          // If logged in, fetch cart from server
          await fetchServerCart();
        } else {
          // If not logged in, load from localStorage
          loadLocalCart();
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to local cart if server fetch fails
        loadLocalCart();
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, [isLoggedIn]);

  // Function to load cart from localStorage
  const loadLocalCart = () => {
    try {
      const savedCart = localStorage.getItem('novinoCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  };

  // Function to fetch cart from server
  const fetchServerCart = async () => {
    try {
      const response = await fetch('/api/cart/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for auth
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.items || []);
      } else {
        throw new Error('Failed to fetch cart from server');
      }
    } catch (error) {
      console.error('Error fetching cart from server:', error);
      throw error;
    }
  };

  // Function to update cart on server
  const updateServerCart = async (updatedCart: CartItem[]) => {
    try {
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: updatedCart }),
        credentials: 'include', // Include cookies for auth
      });

      if (!response.ok) {
        throw new Error('Failed to update cart on server');
      }
    } catch (error) {
      console.error('Error updating cart on server:', error);
    }
  };

  // Sync guest cart to server when user logs in
  useEffect(() => {
    async function syncCartOnLogin() {
      if (isLoggedIn) {
        try {
          // Get local cart
          const localCart = localStorage.getItem('novinoCart');
          
          if (localCart) {
            const parsedLocalCart = JSON.parse(localCart);
            
            // Only sync if there are items in the local cart
            if (parsedLocalCart.length > 0) {
              const response = await fetch('/api/cart/sync', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ guestCartItems: parsedLocalCart }),
                credentials: 'include',
              });
              
              if (response.ok) {
                const data = await response.json();
                setCart(data.items || []);
                
                // Clear local cart after successful sync
                localStorage.removeItem('novinoCart');
              }
            }
          }
        } catch (error) {
          console.error('Error syncing cart on login:', error);
        }
      }
    }
    
    syncCartOnLogin();
  }, [isLoggedIn]);

  // Save cart to localStorage if not logged in
  useEffect(() => {
    if (!isLoggedIn && !isLoading) {
      localStorage.setItem('novinoCart', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn, isLoading]);

  // Update server cart when cart changes for logged-in users
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      updateServerCart(cart);
    }
  }, [cart, isLoggedIn, isLoading]);

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
    isLoading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 