// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtsWj7I-HZCZoLyXAmqO0RBz2pUDXaYiA",
  authDomain: "nurse-flow-d0253.firebaseapp.com",
  projectId: "nurse-flow-d0253",
  storageBucket: "nurse-flow-d0253.firebasestorage.app",
  messagingSenderId: "1060790212453",
  appId: "1:1060790212453:web:9c309e24915785cdd6b38c",
  measurementId: "G-KG1X5NLQYS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);