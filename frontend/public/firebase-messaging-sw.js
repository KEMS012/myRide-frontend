importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCx5kk1qkQBGnERsgzeKlu2xZSkfQP2P1g",
  authDomain: "myryde-ab054.firebaseapp.com",
  projectId: "myryde-ab054",
  storageBucket: "myryde-ab054.firebasestorage.app",
  messagingSenderId: "839830544305",
  appId: "1:839830544305:web:b6a033f088619a6f0e2790",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);
  const notificationTitle = payload.notification?.title || "MyRyde";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/myryde-logo.png",
    badge: "/myryde-logo.png",
    tag: payload.data?.tag || "myryde-notification",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

messaging.onMessage((payload) => {
  console.log("Received foreground message:", payload);
});
