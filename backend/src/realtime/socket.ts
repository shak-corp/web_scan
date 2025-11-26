import { Server } from "socket.io";
import http from "http";

let ioInstance: Server;

export function initRealtimeLogs(server: http.Server) {
  ioInstance = new Server(server, {
    path: "/realtime",
    cors: { origin: process.env.FRONTEND_ORIGIN || "*" },
  });

  ioInstance.on("connection", socket => {
    socket.on("identify", (payload: { userId?: string }) => {
      if (payload?.userId) socket.join(`user-${payload.userId}`);
    });
  });

  return ioInstance;
}

export const io = {
  emit: (...args: any[]) => ioInstance?.emit(...args),
  to: (room: string) => ioInstance?.to(room),
};
