import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFwDfzUVXa8CBj9pPTHZ0qYRMWrOi-GBQ",
  authDomain: "qwitter-c4e47.firebaseapp.com",
  projectId: "qwitter-c4e47",
  storageBucket: "qwitter-c4e47.appspot.com",
  messagingSenderId: "65833096972",
  appId: "1:65833096972:web:86d5aa5326b687c91c5b29",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
