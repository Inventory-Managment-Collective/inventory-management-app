import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAzen9EoJe8hTttd_ADIHQxlTdo6ln1ZsE",
    authDomain: "ingredients-api-81412.firebaseapp.com",
    databaseURL: "https://ingredients-api-81412-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ingredients-api-81412",
    storageBucket: "ingredients-api-81412.firebasestorage.app",
    messagingSenderId: "486309424951",
    appId: "1:486309424951:web:0bd0deee7b6743b49174b2",
    measurementId: "G-DN2PKGFCVZ"
  };


// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);


export { db };