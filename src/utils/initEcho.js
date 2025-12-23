import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

let echoInstance = null;

export const initEcho = (token) => {
  if (echoInstance) {
    echoInstance.disconnect();
  }

  const isSecure = (import.meta.env.VITE_REVERB_SCHEME ?? "http") === "https";
  const port = import.meta.env.VITE_REVERB_PORT ?? (isSecure ? 443 : 8080);

  console.log("🔧 Initializing Echo with config:", {
    key: import.meta.env.VITE_REVERB_APP_KEY,
    host: import.meta.env.VITE_REVERB_HOST,
    port: port,
    scheme: import.meta.env.VITE_REVERB_SCHEME,
    forceTLS: isSecure,
    authEndpoint: `${import.meta.env.VITE_BACKEND_URL}/api/broadcasting/auth`,
  });

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: port,
    wssPort: port,
    forceTLS: isSecure,
    enabledTransports: ["ws", "wss"],
    encrypted: isSecure, // Thêm encrypted flag cho HTTPS
    disableStats: true, // Tắt stats để tránh lỗi với một số proxy
    authEndpoint: `${import.meta.env.VITE_BACKEND_URL}api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest", // Thêm header này
      },
    },
  });

  // Log connection events
  if (echoInstance.connector && echoInstance.connector.pusher) {
    const pusher = echoInstance.connector.pusher;

    pusher.connection.bind("connecting", () => {
      console.log("WebSocket đang kết nối...");
    });

    pusher.connection.bind("connected", () => {
      console.log("WebSocket đã kết nối thành công!");
    });

    pusher.connection.bind("disconnected", () => {
      console.log("WebSocket đã ngắt kết nối");
    });

    pusher.connection.bind("error", (err) => {
      console.error("Lỗi WebSocket:", err);
    });

    pusher.connection.bind("state_change", (states) => {
      console.log(`WebSocket state: ${states.previous} → ${states.current}`);
    });
  }

  return echoInstance;
};

export const getEcho = () => {
  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};