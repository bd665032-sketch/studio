
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBbJKxN9RURA4wege2VXHSId5uyR2eZ7ec",
    authDomain: "minar-go-app.firebaseapp.com",
    databaseURL: "https://minar-go-app-default-rtdb.firebaseio.com",
    projectId: "minar-go-app",
    storageBucket: "minar-go-app.firebasestorage.app",
    messagingSenderId: "1066873493886",
    appId: "1:1066873493886:web:8e82362fca362f512bbb2f"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { db };
