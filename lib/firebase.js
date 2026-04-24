import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
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

export const DRAFT_SCORE_KEYS = ["clarity", "structure", "evidence", "depth"];

function toDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object" && typeof value.seconds === "number") {
    const millis = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000);
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function normalizeScore(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(10, value));
}

export function computeOverallAverage(scores = {}) {
  if (!scores || typeof scores !== "object") {
    return 0;
  }

  const total = DRAFT_SCORE_KEYS.reduce((sum, key) => sum + normalizeScore(scores[key]), 0);
  return total / DRAFT_SCORE_KEYS.length;
}

export function normalizeDraftRecord(record = {}, fallback = {}) {
  const safeRecord = record && typeof record === "object" ? record : {};
  const safeFallback = fallback && typeof fallback === "object" ? fallback : {};

  const draftNumber = Number(safeRecord.draftNumber);
  const normalizedDraftNumber =
    Number.isFinite(draftNumber) && draftNumber > 0 ? Math.floor(draftNumber) : null;

  return {
    id: safeRecord.id || safeFallback.id || null,
    assignmentId: safeRecord.assignmentId || safeFallback.assignmentId || null,
    draftNumber: normalizedDraftNumber,
    scores: safeRecord.scores && typeof safeRecord.scores === "object" ? safeRecord.scores : {},
    feedback: Array.isArray(safeRecord.feedback) ? safeRecord.feedback.filter(Boolean) : [],
    submittedAt: safeRecord.submittedAt || safeRecord.createdAt || safeFallback.submittedAt || null,
  };
}

export async function fetchAssignmentDrafts(assignmentId, options = {}) {
  if (!assignmentId || typeof assignmentId !== "string") {
    return [];
  }

  const draftsRef = collection(db, "assignments", assignmentId, "drafts");
  const max = Number(options.limit);
  const safeLimit = Number.isFinite(max) && max > 0 ? Math.floor(max) : null;
  const draftQuery = safeLimit
    ? query(draftsRef, orderBy("submittedAt", "desc"), limit(safeLimit))
    : query(draftsRef, orderBy("submittedAt", "desc"));

  try {
    const snapshot = await getDocs(draftQuery);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((docSnapshot, index) => {
      const normalized = normalizeDraftRecord(docSnapshot.data(), {
        id: docSnapshot.id,
        assignmentId,
      });

      const submittedTime = toDate(normalized.submittedAt)?.getTime() ?? 0;

      return {
        ...normalized,
        draftNumber: normalized.draftNumber ?? snapshot.size - index,
        overallAverage: computeOverallAverage(normalized.scores),
        submittedAtMillis: submittedTime,
      };
    });
  } catch (error) {
    console.error("Failed to fetch assignment drafts", { assignmentId, error });
    return [];
  }
}

export async function createAssignmentDraft(assignmentId, draft = {}) {
  if (!assignmentId || typeof assignmentId !== "string") {
    throw new Error("A valid assignmentId is required.");
  }

  const normalized = normalizeDraftRecord(draft, { assignmentId });

  const payload = {
    assignmentId,
    draftNumber: normalized.draftNumber ?? 1,
    scores: normalized.scores,
    feedback: normalized.feedback,
    submittedAt: normalized.submittedAt || serverTimestamp(),
  };

  try {
    const draftsRef = collection(db, "assignments", assignmentId, "drafts");
    const docRef = await addDoc(draftsRef, payload);
    return {
      ...normalized,
      id: docRef.id,
      submittedAt: payload.submittedAt,
      overallAverage: computeOverallAverage(normalized.scores),
    };
  } catch (error) {
    console.error("Failed to create assignment draft", { assignmentId, error });
    throw error;
  }
}