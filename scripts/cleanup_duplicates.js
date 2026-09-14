import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAoFux1NV6jRw6-HpYXsUWKJZz4GUq5osk",
  authDomain: "shivam-roy-oils-pos.firebaseapp.com",
  projectId: "shivam-roy-oils-pos",
  storageBucket: "shivam-roy-oils-pos.firebasestorage.app",
  messagingSenderId: "596287479918",
  appId: "1:596287479918:web:9dc227e2de064f0faac67f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanDuplicates() {
  console.log('Fetching inventory docs from Firestore...');
  const snap = await getDocs(collection(db, 'inventory'));
  console.log(`Total docs in inventory collection: ${snap.docs.length}`);

  const seen = new Map();
  const toDelete = [];
  const toKeep = [];

  for (const d of snap.docs) {
    const data = d.data();
    const name = String(data.product_name || '').trim().toLowerCase();

    if (!name) {
      toDelete.push(d.id);
      continue;
    }

    if (seen.has(name)) {
      toDelete.push(d.id);
    } else {
      seen.set(name, { id: d.id, ...data });
      toKeep.push({ id: d.id, name: data.product_name, stock: data.stock_quantity, price: data.unit_price });
    }
  }

  console.log(`Unique products to keep: ${toKeep.length}`);
  console.log(`Duplicate docs to delete: ${toDelete.length}`);
  console.log('Products kept:', toKeep);

  let deleted = 0;
  // Delete in batches
  for (let i = 0; i < toDelete.length; i += 20) {
    const batch = toDelete.slice(i, i + 20);
    await Promise.all(batch.map(id => deleteDoc(doc(db, 'inventory', id))));
    deleted += batch.length;
    console.log(`Deleted ${deleted}/${toDelete.length}...`);
  }

  console.log('Finished cleaning Firestore duplicate items!');
  process.exit(0);
}

cleanDuplicates().catch(err => {
  console.error('Error cleaning duplicates:', err);
  process.exit(1);
});
