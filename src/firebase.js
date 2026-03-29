import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALkQb7SdvF2dVABp7nrUFW95gOku3Vi84",
  authDomain: "ask-lipuvka.firebaseapp.com",
  projectId: "ask-lipuvka",
  storageBucket: "ask-lipuvka.firebasestorage.app",
  messagingSenderId: "938299850638",
  appId: "1:938299850638:web:ca9e5ad90f93856cab6edf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);