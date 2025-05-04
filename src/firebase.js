// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDC4ReCFiO8I5Sz-dcuIXvPo6xOnHSvyGg",
  authDomain: "recipes-and-ingredients.firebaseapp.com",
  databaseURL: "https://recipes-and-ingredients-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "recipes-and-ingredients",
  storageBucket: "recipes-and-ingredients.firebasestorage.app",
  messagingSenderId: "181011966222",
  appId: "1:181011966222:web:e6a9d7a15a63c4d35b8f5f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);