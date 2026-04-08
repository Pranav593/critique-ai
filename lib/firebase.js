import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
//test 2
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function createAssignment(userId, data = {}) {
  if (!userId) {
    throw new Error("A userId is required to create an assignment.");
  }

  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });

  return addDoc(collection(userRef, "assignments"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getAssignments(userId) {
  if (!userId) {
    throw new Error("A userId is required to fetch assignments.");
  }

  const assignmentsRef = collection(db, "users", userId, "assignments");
  const assignmentsQuery = query(assignmentsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(assignmentsQuery);

  return snapshot.docs.map((assignmentDoc) => ({
    id: assignmentDoc.id,
    ...assignmentDoc.data(),
  }));
}

export async function getAssignment(userId, assignmentId) {
  if (!userId || !assignmentId) {
    throw new Error("Both userId and assignmentId are required to fetch an assignment.");
  }

  const assignmentRef = doc(db, "users", userId, "assignments", assignmentId);
  const snapshot = await getDoc(assignmentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function createDraft(userId, assignmentId, data = {}) {
  if (!userId || !assignmentId) {
    throw new Error("Both userId and assignmentId are required to create a draft.");
  }

  const draftsRef = collection(db, "users", userId, "assignments", assignmentId, "drafts");

  return addDoc(draftsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getDrafts(userId, assignmentId) {
  if (!userId || !assignmentId) {
    throw new Error("Both userId and assignmentId are required to fetch drafts.");
  }

  const draftsRef = collection(db, "users", userId, "assignments", assignmentId, "drafts");
  const draftsQuery = query(draftsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(draftsQuery);

  return snapshot.docs.map((draftDoc) => ({
    id: draftDoc.id,
    ...draftDoc.data(),
  }));
}