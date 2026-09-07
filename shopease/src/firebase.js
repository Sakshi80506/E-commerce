// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDiz_U0fmJlZ9P9sgndWwzAJB8gwTLC8FE",
  authDomain: "mclaren-hackathon-login.firebaseapp.com",
  projectId: "mclaren-hackathon-login",
  storageBucket: "mclaren-hackathon-login.firebasestorage.app",
  messagingSenderId: "415274144730",
  appId: "1:415274144730:web:b20f262a7dad3acfaa26e3",
  measurementId: "G-6YB91Q6CFM"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
