import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import courseRoutes from "./routes/courses";
import roundRoutes from "./routes/rounds";
import friendRoutes from "./routes/friends";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/rounds", roundRoutes);
app.use("/api/friends", friendRoutes);

app.get("/", (req, res) => {
  res.send("Profile Service is running");
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("close", () => {
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket Server Error:", error);
  });
});

function broadcast(data: any) {
  const message = JSON.stringify(data);
  let sentCount = 0;

  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
      sentCount++;
    }
  }
}

if (require.main === module) {
  server.listen(PORT, () => {});
}

export { app, wss, broadcast };
