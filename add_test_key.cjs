const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, Timestamp } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCKnhEf77Kx3R9bVh0fBdgxIPXHX02gZ4c",
  authDomain: "aegis-crypt.firebaseapp.com",
  databaseURL: "https://aegis-crypt-default-rtdb.firebaseio.com",
  projectId: "aegis-crypt",
  storageBucket: "aegis-crypt.firebasestorage.app",
  messagingSenderId: "849684986028",
  appId: "1:849684986028:web:38d693142dd944964ec709"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addTestKey = async () => {
    const key = "TEST-7DAY-AEGIS-FREE";
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    try {
        await setDoc(doc(db, "licenses", key), {
            isActive: true,
            type: "7-Day Trial",
            expiryDate: Timestamp.fromDate(expiry),
            hwid: null,
            key: key
        });
        console.log(`\n✅ SUCCESS! 7-Day Test Key Created: ${key}`);
        console.log(`📅 Expiry: ${expiry.toLocaleDateString()}\n`);
        process.exit(0);
    } catch (e) {
        console.error("\n❌ FAILED to create key:", e.message);
        process.exit(1);
    }
};

addTestKey();
