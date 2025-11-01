// Client-side helper to register service worker and subscribe to push notifications (requires server VAPID public key)
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.info('Service worker registered', reg);
    return reg;
  } catch (e) {
    console.warn('Service worker registration failed', e);
    return null;
  }
}

export async function subscribeToPush(registration, vapidPublicKey) {
  if (!registration || !('PushManager' in window)) return null;
  try {
    const sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) });
    return sub;
  } catch (e) {
    console.warn('Push subscribe failed', e);
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default { registerServiceWorker, subscribeToPush };
