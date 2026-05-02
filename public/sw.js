self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || '⏰ Chief360 Alert';
    const options = {
        body: data.body || 'You have a deadline coming up!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
