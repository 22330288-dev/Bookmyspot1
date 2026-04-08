import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAadYBesbhPYIOQuOdVTU6ZJdOBYezTnDI",
  authDomain: "venue-app-84414.firebaseapp.com",
  projectId: "venue-app-84414",
  storageBucket: "venue-app-84414.firebasestorage.app",
  messagingSenderId: "583422762185",
  appId: "1:583422762185:web:ba50ec69338f745379c118",
  measurementId: "G-0F92YKCDHR"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();