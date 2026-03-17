import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDFt1_zHDe3OOKutPRjf_IwisfZuUcRkWI",
  authDomain: "cashly-9ede3.firebaseapp.com",
  projectId: "cashly-9ede3",
  storageBucket: "cashly-9ede3.firebasestorage.app",
  messagingSenderId: "836349136398",
  appId: "1:836349136398:web:40fb7b43e97f713ac0f65f"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()