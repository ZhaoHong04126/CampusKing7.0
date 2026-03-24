import { createContext, useContext, useEffect, useState } from 'react';
import { auth, provider } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  signInAnonymously,
  sendPasswordResetEmail,
  setPersistence,
  sessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password, remember) => {
    const persistence = remember ? browserLocalPersistence : sessionPersistence;
    return setPersistence(auth, persistence).then(() => {
      return signInWithEmailAndPassword(auth, email, password);
    });
  };

  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, provider);
  };

  const loginAnon = () => {
    return signInAnonymously(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loginWithGoogle,
    loginAnon,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
