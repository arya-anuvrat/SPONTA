import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  if (__DEV__) {
    console.log('🔐 AuthProvider: Initializing...');
  }

  useEffect(() => {
    if (__DEV__) {
      console.log('🔐 AuthProvider: useEffect running, auth:', !!auth);
    }
    
    // Set loading to false immediately if no auth (don't wait)
    if (!auth) {
      console.warn('⚠️ AuthProvider: Firebase auth not initialized - proceeding without auth');
      setLoading(false);
      return;
    }

    // Add timeout to prevent infinite loading (reduced to 3 seconds)
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ AuthProvider: Loading timeout - proceeding anyway');
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    try {
      if (__DEV__) {
        console.log('🔐 AuthProvider: Setting up auth state listener...');
      }
      
      // Set up auth listener with immediate callback
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (__DEV__) {
          console.log('🔐 AuthProvider: Auth state changed, user:', user ? user.uid : 'null');
        }
        setCurrentUser(user);
        setLoading(false);
        clearTimeout(timeout);
      }, (error) => {
        console.error('❌ AuthProvider: Auth state change error:', error);
        setLoading(false);
        clearTimeout(timeout);
      });

      return () => {
        try {
          unsubscribe();
        } catch (e) {
          console.error('Error unsubscribing:', e);
        }
        clearTimeout(timeout);
      };
    } catch (error) {
      console.error('❌ AuthProvider: Error setting up auth listener:', error);
      setLoading(false);
      clearTimeout(timeout);
    }
  }, []); // Empty array - only run once on mount

  const value = {
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
