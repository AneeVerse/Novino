// Simple in-memory event manager for server-sent events
// In a production environment, you'd use Redis or a similar solution for this

type EventListener = (userId: string) => void;

// Collection of listeners by event type
const listeners: {
  [eventType: string]: {
    [userId: string]: EventListener[]
  }
} = {
  'user-blocked': {}
};

/**
 * Register a listener for when a user is blocked
 * @param userId The user ID to listen for
 * @param callback Function to call when the user is blocked
 */
export function listenForUserBlocked(userId: string, callback: EventListener) {
  if (!listeners['user-blocked'][userId]) {
    listeners['user-blocked'][userId] = [];
  }
  
  listeners['user-blocked'][userId].push(callback);
  
  // Return a function to unregister the listener
  return () => {
    if (listeners['user-blocked'][userId]) {
      listeners['user-blocked'][userId] = listeners['user-blocked'][userId].filter(
        listener => listener !== callback
      );
      
      // Clean up if no more listeners for this user
      if (listeners['user-blocked'][userId].length === 0) {
        delete listeners['user-blocked'][userId];
      }
    }
  };
}

/**
 * Broadcast a notification that a user has been blocked
 * @param userId The ID of the user that was blocked
 */
export function broadcastUserBlocked(userId: string) {
  if (listeners['user-blocked'][userId]) {
    for (const listener of listeners['user-blocked'][userId]) {
      try {
        listener(userId);
      } catch (error) {
        console.error('Error in user-blocked listener:', error);
      }
    }
  }
  
  // Also notify global listeners (if any)
  if (listeners['user-blocked']['*']) {
    for (const listener of listeners['user-blocked']['*']) {
      try {
        listener(userId);
      } catch (error) {
        console.error('Error in global user-blocked listener:', error);
      }
    }
  }
} 