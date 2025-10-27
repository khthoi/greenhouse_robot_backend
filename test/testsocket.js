import { io } from "socket.io-client";

const socket = io("ws://localhost:3003", { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server");
});

// 👉 Lắng nghe tất cả sự kiện động
socket.onAny((event, data) => {
  console.log(`📨 [${event}]`, data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});
