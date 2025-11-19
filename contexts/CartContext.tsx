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
  isLoggedIn: boolean;
  isAuthReady: boolean;
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
  isLoggedIn: false,
  isAuthReady: false,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Initialize cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Replace NextAuth session with custom token-based auth check
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Check authentication on mount and when cookies change
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        try {
          // First check: Is there a profile page check we can do?
          // If we're on the profile page, we're definitely logged in
          const isOnProfilePage = window.location.pathname.includes('/profile');
          if (isOnProfilePage) {
            console.log('Auth determined from profile page access');
            setIsLoggedIn(true);
            return;
          }
          
          // Second check: Try API auth check, but only do this once on mount
          const response = await fetch('/api/auth/me', {
            credentials: 'include'
          });
          
          if (response.ok) {
            console.log('Auth confirmed via API');
            setIsLoggedIn(true);
            return;
          }
          
          // Third check: Cookie exists check
          const cookies = document.cookie.split(';');
          const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
          
          if (tokenCookie && tokenCookie.length > 6) {
            console.log('Auth token found in cookies');
            setIsLoggedIn(true);
            return;
          }
          
          // If we get here, user is not logged in
          console.log('User is not authenticated');
          setIsLoggedIn(false);
        } catch (error) {
          console.error('Auth check error:', error);
          // If error occurred, default to cookie check as fallback
          const hasToken = document.cookie.includes('token=');
          console.log('Fallback auth check - Token present:', hasToken);
          setIsLoggedIn(hasToken);
        } finally {
          setIsAuthReady(true);
        }
      }
    };
    
    // Only check on mount
    checkAuth();
    
    // Set up a listener for storage events to detect login/logout from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'logout' || event.key === 'login') {
        setIsAuthReady(false);
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load cart on mount and when authentication status changes
  useEffect(() => {
    let isMounted = true;
    
    async function loadCart() {
      setIsLoading(true);
      try {
        if (isLoggedIn) {
          // If logged in, fetch cart from server first
          try {
            await fetchServerCart();
          } catch (error) {
            console.error('Error fetching server cart:', error);
            // Fallback to local cart if server fetch fails
            if (isMounted) {
              loadLocalCart();
            }
          }
        } else {
          // If not logged in, load from localStorage
          loadLocalCart();
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to local cart if anything fails
        if (isMounted) {
          loadLocalCart();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCart();
    
    return () => {
      isMounted = false;
    };
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

  // Sync guest cart to server when user logs in (only once)
  useEffect(() => {
    const syncRef = { hasSynced: false };
    
    async function syncCartOnLogin() {
      if (isLoggedIn && !syncRef.hasSynced) {
        try {
          // First, fetch server cart to see what's there
          const serverResponse = await fetch('/api/cart/get', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          
          let serverCartItems: CartItem[] = [];
          if (serverResponse.ok) {
            const serverData = await serverResponse.json();
            serverCartItems = serverData.items || [];
          }
          
          // Get local cart
          const localCart = localStorage.getItem('novinoCart');
          
          if (localCart) {
            try {
              const parsedLocalCart = JSON.parse(localCart);
              
              // Only sync if there are items in the local cart
              if (Array.isArray(parsedLocalCart) && parsedLocalCart.length > 0) {
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
                  syncRef.hasSynced = true;
                } else {
                  // If sync fails, merge locally and show server cart
                  const mergedCart = [...serverCartItems];
                  const now = new Date();
                  
                  for (const guestItem of parsedLocalCart) {
                    const existingIndex = mergedCart.findIndex(item => 
                      String(item.id) === String(guestItem.id) && 
                      ((!item.variant && !guestItem.variant) || item.variant === guestItem.variant)
                    );
                    
                    if (existingIndex !== -1) {
                      mergedCart[existingIndex].quantity += guestItem.quantity || 1;
                    } else {
                      mergedCart.push({ 
                        ...guestItem, 
                        addedAt: guestItem.addedAt || now 
                      });
                    }
                  }
                  
                  setCart(mergedCart);
                  localStorage.removeItem('novinoCart');
                  syncRef.hasSynced = true;
                }
              } else if (serverCartItems.length > 0) {
                // No local cart, but server has items
                setCart(serverCartItems);
                syncRef.hasSynced = true;
              } else {
                syncRef.hasSynced = true;
              }
            } catch (parseError) {
              console.error('Error parsing local cart:', parseError);
              // If parse fails, use server cart
              if (serverCartItems.length > 0) {
                setCart(serverCartItems);
              }
              localStorage.removeItem('novinoCart');
              syncRef.hasSynced = true;
            }
          } else if (serverCartItems.length > 0) {
            // No local cart, but server has items
            setCart(serverCartItems);
            syncRef.hasSynced = true;
          } else {
            syncRef.hasSynced = true;
          }
        } catch (error) {
          console.error('Error syncing cart on login:', error);
          // Try to fetch server cart as fallback
          try {
            await fetchServerCart();
          } catch (fetchError) {
            console.error('Error fetching server cart:', fetchError);
          }
          syncRef.hasSynced = true;
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

  // Update server cart when cart changes for logged-in users (debounced)
  useEffect(() => {
    if (isLoggedIn && !isLoading && cart.length >= 0) {
      // Debounce updates to prevent too many API calls
      const timeoutId = setTimeout(() => {
        updateServerCart(cart);
      }, 500); // 500ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [cart, isLoggedIn, isLoading]);

  // Add item to cart
  const addToCart = (item: CartItem) => {
    // Ensure item has all required fields
    if (!item.id || !item.name || item.price === undefined || !item.image) {
      console.error('Invalid cart item:', item);
      return;
    }
    
    setCart(prevCart => {
      // Ensure quantity is at least 1
      const quantity = item.quantity || 1;
      
      // Normalize IDs for comparison (handle both string and number)
      const itemId = String(item.id).trim();
      
      // Check if item already exists in cart (with same id AND name AND variant if applicable)
      // This ensures different products are never merged, even if IDs somehow match
      const existingItemIndex = prevCart.findIndex(
        cartItem => {
          const cartItemId = String(cartItem.id).trim();
          const idMatch = cartItemId === itemId;
          const nameMatch = cartItem.name === item.name;
          const variantMatch = (!cartItem.variant && !item.variant) || cartItem.variant === item.variant;
          
          // Only consider it a match if ALL three match: ID, name, and variant
          return idMatch && nameMatch && variantMatch;
        }
      );

      if (existingItemIndex !== -1) {
        // Update quantity of existing item (same product, same variant)
        console.log('Updating existing cart item:', item.name, 'Quantity:', prevCart[existingItemIndex].quantity, '+', quantity);
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        // Ensure addedAt is set
        if (!updatedCart[existingItemIndex].addedAt) {
          updatedCart[existingItemIndex].addedAt = new Date();
        }
        return updatedCart;
      } else {
        // Add new item to cart with proper structure (different product)
        console.log('Adding new cart item:', item.name, 'ID:', item.id);
        const newItem: CartItem = {
          ...item,
          id: item.id, // Preserve original ID type
          quantity: quantity,
          addedAt: item.addedAt || new Date(),
        };
        return [...prevCart, newItem];
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
    isLoggedIn,
    isAuthReady,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};