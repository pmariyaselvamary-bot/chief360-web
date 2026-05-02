importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCLFwe1ykSKjccZG2NQfhlpEqeJnnJu--o",
    authDomain: "chief360-223e4.firebaseapp.com",
    projectId: "chief360-223e4",
    storageBucket: "chief360-223e4.firebasestorage.app",
    messagingSenderId: "744083138823",
    appId: "1:744083138823:web:c322e9290e00f1bad1bda2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification;
    self.registration.showNotification(title, {
        body,
        icon: '/favicon.ico'
    });
});
