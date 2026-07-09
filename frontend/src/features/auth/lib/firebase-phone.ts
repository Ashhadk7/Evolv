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

  if (missing.length) {
    throw new Error(`Firebase phone auth is missing: ${missing.join(", ")}.`);
  }

  return firebaseEnv as FirebaseOptions;
}

export function getFirebasePhoneAuth() {
  const app = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
  return getAuth(app);
}

// module-level singleton so re-renders / StrictMode double-invokes don't create duplicates
let activeVerifier: RecaptchaVerifier | null = null;

export function createPhoneRecaptcha(container: HTMLElement) {
  // if one already exists, clear it before making a new one
  if (activeVerifier) {
    try {
      activeVerifier.clear();
    } catch {
      // ignore if already cleared/unmounted
    }
    activeVerifier = null;
    // Firebase's clear() also wipes the container's injected DOM,
    // but just in case, reset it manually too:
    container.innerHTML = "";
  }

  activeVerifier = new RecaptchaVerifier(getFirebasePhoneAuth(), container, { size: "invisible" });
  return activeVerifier;
}

export function resetPhoneRecaptcha() {
  if (activeVerifier) {
    try {
      activeVerifier.clear();
    } catch {
      // ignore
    }
    activeVerifier = null;
  }
}

export function sendPhoneOtp(phone: string, verifier: RecaptchaVerifier) {
  return signInWithPhoneNumber(getFirebasePhoneAuth(), phone, verifier);
}

// "use client";

// import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// const firebaseEnv = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
// };

// function getFirebaseConfig(): FirebaseOptions {
//   const missing = Object.entries(firebaseEnv)
//     .filter(([, value]) => !value)
//     .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`);

//   if (missing.length) {
//     throw new Error(`Firebase phone auth is missing: ${missing.join(", ")}.`);
//   }

//   return firebaseEnv as FirebaseOptions;
// }

// export function getFirebasePhoneAuth() {
//   const app = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
//   return getAuth(app);
// }

// export function createPhoneRecaptcha(container: HTMLElement) {
//   return new RecaptchaVerifier(getFirebasePhoneAuth(), container, { size: "invisible" });
// }

// export function sendPhoneOtp(phone: string, verifier: RecaptchaVerifier) {
//   return signInWithPhoneNumber(getFirebasePhoneAuth(), phone, verifier);
// }
