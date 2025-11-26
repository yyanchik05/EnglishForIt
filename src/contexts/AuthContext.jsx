import React, { useContext, useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { initializeApp } from "firebase/app";
// Імпортуємо твій існуючий конфіг (перевір, щоб шлях був правильний!)
import { db } from "../firebase"; 

// Нам треба отримати сам об'єкт auth з firebase
const auth = getAuth(); 

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Реєстрація
  async function signup(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Відправляємо лист підтвердження
    await sendEmailVerification(userCredential.user);
    return userCredential;
  }

  // 2. Вхід
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // 3. Вихід
  function logout() {
    return signOut(auth);
  }

  // 4. Слідкуємо за зміною користувача (зайшов/вийшов)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}