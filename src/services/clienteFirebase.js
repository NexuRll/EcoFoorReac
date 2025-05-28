// Servicio actualizado: registrarClienteConAuth

import { db, secondaryAuth } from "./firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import {
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  setDoc, 
  doc
} from "firebase/firestore";

export const registrarClienteConAuth = async (datos) => {
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, datos.email, datos.password);
    await sendEmailVerification(cred.user);
    
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nombre: datos.nombre || "",
      comuna: datos.comuna || "",
      direccion: datos.direccion || "",
      tipoUsuario: "cliente",
      correo: datos.email || "",
      telefono: datos.telefono || "",
      createdAt: new Date().toISOString(),
      emailVerified: false
    });
    
    await secondaryAuth.signOut();
    return cred;
  } catch (error) {
    console.error("Error registrando cliente:", error);
    throw error;
  }
};
