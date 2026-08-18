import { getMessagingInstance } from "./firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("Browser does not support notifications.");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Notification permission denied.");
    return null;
  }

  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn("FCM is not supported in this browser.");
      return null;
    }

    const { getToken } = await import("firebase/messaging");
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      console.log("FCM token obtained:", token);
      return token;
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }

  return null;
}

export async function saveFcmToken(userId, token) {
  if (!userId || !token) return;
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    await updateDoc(userRef, { fcmToken: token });
  }
}

export function onForegroundNotification(callback) {
  let unsub = null;
  getMessagingInstance().then((messaging) => {
    if (!messaging) return;
    import("firebase/messaging").then(({ onMessage }) => {
      unsub = onMessage(messaging, (payload) => {
        callback(payload);
      });
    });
  });
  return () => {
    if (unsub) unsub();
  };
}

export function showLocalNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/myryde-logo.png",
      badge: "/myryde-logo.png",
      tag: "myryde-notification",
    });
  } catch (err) {
    console.error("Local notification error:", err);
  }
}
