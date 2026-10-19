import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import type { AppData } from './types';
import firebaseConfig from '../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseConfigured = Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);

const app = firebaseConfigured
  ? (getApps()[0] ?? initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : null;

export async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or network connection.');
    }
  }
}
testConnection();

export async function signInGoogle() {
  if (!auth) throw new Error('Firebase authentication is not configured.');
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signInEmail(email:string,password:string) {
  if (!auth) throw new Error('Firebase authentication is not configured.');
  return signInWithEmailAndPassword(auth,email,password);
}

export async function registerEmail(email:string,password:string) {
  if (!auth) throw new Error('Firebase authentication is not configured.');
  return createUserWithEmailAndPassword(auth,email,password);
}

export async function signOutUser() {
  if (auth) await signOut(auth);
}

export function watchUser(cb:(user:User|null)=>void) {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth,cb);
}

export async function loadCloudData(uid:string):Promise<Partial<AppData>|null> {
  if (!db) return null;
  const path = `users/${uid}/app/data`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'app', 'data'));
    return snap.exists() ? snap.data() as Partial<AppData> : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCloudData(uid:string,data:AppData) {
  if (!db) throw new Error('Firebase is not configured.');
  const path = `users/${uid}/app/data`;
  try {
    await setDoc(doc(db, 'users', uid, 'app', 'data'), { ...data, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
