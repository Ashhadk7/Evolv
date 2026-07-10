"use client";

import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
};

function getFirebaseConfig(): FirebaseOptions {
  const missing = Object.entries(firebaseEnv)
    .filter(([, value]) => !value)
    .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`);

  if (missing.length) throw new Error(`Firebase phone auth is missing: ${missing.join(", ")}.`);
  return firebaseEnv as FirebaseOptions;
}

export function getFirebasePhoneAuth() {
  const app = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
  return getAuth(app);
}

let activeVerifier: RecaptchaVerifier | null = null;

export function createPhoneRecaptcha(container: HTMLElement) {
  if (activeVerifier) {
    activeVerifier.clear();
    activeVerifier = null;
    container.innerHTML = "";
  }

  activeVerifier = new RecaptchaVerifier(getFirebasePhoneAuth(), container, { size: "invisible" });
  return activeVerifier;
}

export function sendPhoneOtp(phone: string, verifier: RecaptchaVerifier) {
  return signInWithPhoneNumber(getFirebasePhoneAuth(), phone, verifier);
}
