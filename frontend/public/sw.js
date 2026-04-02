self.addEventListener("push", (event) => {
    if (!event.data) return;
  
    const data = event.data.json();
  
    event.waitUntil(
      self.registration.showNotification(data.title || "MedAlert", {
        body: data.body || "You have a reminder.",
        icon: "/pill-icon.png", // optional — add an icon to public/ if you have one
        badge: "/pill-icon.png",
        data: data.url || "/reminders",
      })
    );
  });
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data || "/reminders")
    );
  });