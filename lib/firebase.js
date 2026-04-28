import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

/* =====================================================
   DRAFT UTILITIES
===================================================== */

export const DRAFT_SCORE_KEYS = ["clarity", "structure", "evidence", "depth"];

function toDate(value) {
  if (!value) return null;

  if (typeof value?.toDate === "function") return value.toDate();

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object" && typeof value.seconds === "number") {
    const millis =
      value.seconds * 1000 +
      Math.floor((value.nanoseconds || 0) / 1000000);
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function normalizeScore(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(10, value));
}

export function computeOverallAverage(scores = {}) {
  if (!scores || typeof scores !== "object") return 0;

  const total = DRAFT_SCORE_KEYS.reduce(
    (sum, key) => sum + normalizeScore(scores[key]),
    0
  );

  return total / DRAFT_SCORE_KEYS.length;
}

export function normalizeDraftRecord(record = {}, fallback = {}) {
  const safeRecord = typeof record === "object" ? record : {};
  const safeFallback = typeof fallback === "object" ? fallback : {};

  const draftNumber = Number(safeRecord.draftNumber);
  const normalizedDraftNumber =
    Number.isFinite(draftNumber) && draftNumber > 0
      ? Math.floor(draftNumber)
      : null;

  return {
    id: safeRecord.id || safeFallback.id || null,
    assignmentId: safeRecord.assignmentId || safeFallback.assignmentId || null,
    draftNumber: normalizedDraftNumber,
    scores:
      safeRecord.scores && typeof safeRecord.scores === "object"
        ? safeRecord.scores
        : {},
    feedback: Array.isArray(safeRecord.feedback)
      ? safeRecord.feedback.filter(Boolean)
      : [],
    submittedAt:
      safeRecord.submittedAt ||
      safeRecord.createdAt ||
      safeFallback.submittedAt ||
      null,
  };
}

/* =====================================================
   ASSIGNMENTS (users/{userId}/assignments)
===================================================== */

export async function createAssignment(userId, data = {}) {
  if (!userId) {
    throw new Error("A userId is required to create an assignment.");
  }

  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });

  const docRef = await addDoc(collection(userRef, "assignments"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getAssignments(userId) {
  if (!userId) {
    throw new Error("A userId is required to fetch assignments.");
  }

  const assignmentsRef = collection(db, "users", userId, "assignments");
  const assignmentsQuery = query(
    assignmentsRef,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(assignmentsQuery);

  const assignmentsWithDraftCount = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const draftsRef = collection(db, "users", userId, "assignments", docSnap.id, "drafts");
      const draftsSnap = await getDocs(draftsRef);
      return {
        id: docSnap.id,
        ...docSnap.data(),
        draftCount: draftsSnap.size,
      };
    })
  );

  return assignmentsWithDraftCount;
}

export async function getAssignment(userId, assignmentId) {
  if (!userId || !assignmentId) {
    throw new Error(
      "Both userId and assignmentId are required to fetch an assignment."
    );
  }

  const assignmentRef = doc(
    db,
    "users",
    userId,
    "assignments",
    assignmentId
  );

  const snapshot = await getDoc(assignmentRef);
  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateAssignment(userId, assignmentId, data = {}) {
  if (!userId || !assignmentId) {
    throw new Error("Both userId and assignmentId are required to update an assignment.");
  }

  const assignmentRef = doc(db, "users", userId, "assignments", assignmentId);
  await setDoc(assignmentRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteAssignment(userId, assignmentId) {
  if (!userId || !assignmentId) {
    throw new Error("Both userId and assignmentId are required to delete an assignment.");
  }

  // Delete all drafts first
  const draftsRef = collection(db, "users", userId, "assignments", assignmentId, "drafts");
  const draftsSnap = await getDocs(draftsRef);
  
  const deletePromises = draftsSnap.docs.map(docSnap => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);

  // Delete assignment document
  const assignmentRef = doc(db, "users", userId, "assignments", assignmentId);
  await deleteDoc(assignmentRef);
}

/* =====================================================
   DRAFTS (users/{userId}/assignments/{assignmentId}/drafts)
===================================================== */

export async function createDraft(userId, assignmentId, data = {}) {
  if (!userId || !assignmentId) {
    throw new Error(
      "Both userId and assignmentId are required to create a draft."
    );
  }

  const draftsRef = collection(
    db,
    "users",
    userId,
    "assignments",
    assignmentId,
    "drafts"
  );

  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(draftsRef, payload);

  return {
    id: docRef.id,
    ...payload,
    overallAverage: computeOverallAverage(data.scores || {}),
  };
}

export async function getDrafts(userId, assignmentId, options = {}) {
  if (!userId || !assignmentId) {
    throw new Error(
      "Both userId and assignmentId are required to fetch drafts."
    );
  }

  const draftsRef = collection(
    db,
    "users",
    userId,
    "assignments",
    assignmentId,
    "drafts"
  );

  const max = Number(options.limit);
  const safeLimit =
    Number.isFinite(max) && max > 0 ? Math.floor(max) : null;

  const draftsQuery = safeLimit
    ? query(draftsRef, orderBy("createdAt", "desc"), limit(safeLimit))
    : query(draftsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(draftsQuery);

  return snapshot.docs.map((draftDoc, index) => {
    const normalized = normalizeDraftRecord(draftDoc.data(), {
      id: draftDoc.id,
      assignmentId,
    });

    return {
      ...normalized,
      draftNumber:
        normalized.draftNumber ?? snapshot.size - index,
      overallAverage: computeOverallAverage(normalized.scores),
      submittedAtMillis:
        toDate(normalized.submittedAt)?.getTime() ?? 0,
    };
  });
}

export function subscribeToDrafts(userId, assignmentId, callback) {
  if (!userId || !assignmentId) {
    throw new Error(
      "Both userId and assignmentId are required to subscribe to drafts."
    );
  }

  const draftsRef = collection(
    db,
    "users",
    userId,
    "assignments",
    assignmentId,
    "drafts"
  );

  const draftsQuery = query(
    draftsRef,
    orderBy("createdAt", "desc")
  );

  return onSnapshot(draftsQuery, (snapshot) => {
    const drafts = snapshot.docs.map((draftDoc, index) => {
      const normalized = normalizeDraftRecord(draftDoc.data(), {
        id: draftDoc.id,
        assignmentId,
      });

      return {
        ...normalized,
        draftNumber:
          normalized.draftNumber ?? snapshot.size - index,
        overallAverage: computeOverallAverage(normalized.scores),
        submittedAtMillis:
          toDate(normalized.submittedAt)?.getTime() ?? 0,
      };
    });

    callback(drafts);
  });
}