import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxY-KJ8H1m-9DO2_fs5qLo9MEwb7PiHVY",
  authDomain: "book-me-a6d98.firebaseapp.com",
  projectId: "book-me-a6d98",
  storageBucket: "book-me-a6d98.appspot.com",
  messagingSenderId: "162115788301",
  appId: "1:162115788301:web:fe46d6ed06f95fc2f87f44",
  measurementId: "G-DEXMQ2FKFM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getAllUsers() {
  const usersCollection = collection(db, "books");
  const snapshot = await getDocs(usersCollection);
  const users = snapshot.docs.map(doc => ({ desc: doc.desc, ...doc.data() }));
  return users;
}

