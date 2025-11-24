import { initializeApp } from "firebase/app";
import { getAuth, PhoneAuthProvider, signInWithCredential } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD3dWHoeggbnETgpTC45ZfPSFuM6YUtkqo",
    authDomain: "grabbitt-aed50.firebaseapp.com",
    projectId: "grabbitt-aed50",
    storageBucket: "grabbitt-aed50.firebasestorage.app",
    messagingSenderId: "686996955331",
    appId: "1:686996955331:web:506ff599378f01503e8276",
    measurementId: "G-HRVBQ5B38Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { PhoneAuthProvider, signInWithCredential };