import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmCrXCj5whBfU_IR4kAeLH85-ZNBhQT9k",
  authDomain: "sight-26775.firebaseapp.com",
  projectId: "sight-26775",
  storageBucket: "sight-26775.appspot.com",
  messagingSenderId: "574726470040",
  appId: "1:574726470040:web:ab56b90cd5942de9fed3ed"
};

const app = initializeApp(firebaseConfig);
const imageDb = getStorage(app);
const textDb = getFirestore(app);

export { imageDb, textDb };