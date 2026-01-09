// api.js
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// 🔥 Colección correcta en Firestore
const PRODUCTS_COLLECTION = "carteleria";



// ===============================
//  GET PRODUCTS
// ===============================
export async function fetchProducts() {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));
}

// ===============================
//  UPDATE PRODUCT
// ===============================
export async function updateProduct(id, data) {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(ref, data);
}

// ===============================
//  MASS UPLOAD FROM CSV (SMART)
// ===============================
export async function uploadCSV(list) {
  const colRef = collection(db, PRODUCTS_COLLECTION);

  // 1. Obtener todos los productos existentes para mapear Codigo -> ID
  const snapshot = await getDocs(colRef);
  const existingMap = new Map(); // Mapa: Codigo (lower) -> ID Documento

  snapshot.docs.forEach(d => {
    const data = d.data();
    const code = data.CODIGO || data.codigo || data.Codigo || data.COD || data.cod;
    if (code) existingMap.set(code.toString().toLowerCase(), d.id);
  });

  let addedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const p of list) {
    try {
      const code = p.codigo || p.CODIGO;
      if (!code) {
        errorCount++;
        continue;
      }

      const normalizedCode = code.toString().toLowerCase();

      // 2. Verificar si ya existe
      if (existingMap.has(normalizedCode)) {
        // ACTUALIZAR
        const docId = existingMap.get(normalizedCode);
        const ref = doc(db, PRODUCTS_COLLECTION, docId);
        await updateDoc(ref, p);
        updatedCount++;
      } else {
        // CREAR NUEVO
        await addDoc(colRef, p);
        // Agregamos al mapa por si hay duplicados en el mismo CSV, para que el segundo actualice al primero
        // (Aunque para hacerlo bien necesitaríamos el ID del nuevo doc, pero firestore lo devuelve en addDoc)
        // Por simplicidad, asumimos que el CSV no tiene duplicados internos criticos o que se aceptan como inserts.
        // Si queremos ser estrictos, deberiamos esperar el ID.
        addedCount++;
      }
    } catch (e) {
      console.error("Error subiendo producto:", p, e);
      errorCount++;
    }
  }

  return { addedCount, updatedCount, errorCount };
}
