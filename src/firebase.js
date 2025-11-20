import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1D35iWMind28czQHXJmFAWM8qzHv-hjc",
  authDomain: "english-for-it-6d8a7.firebaseapp.com",
  projectId: "english-for-it-6d8a7",
  storageBucket: "english-for-it-6d8a7.firebasestorage.app",
  messagingSenderId: "794769711174",
  appId: "1:794769711174:web:489262f447c1939b302a47"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);