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

// Logging middleware for all API calls
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path}`, req.body);
  next();
});

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
  console.log("WebSocket client connected. Total clients:", clients.size + 1);
  clients.add(ws);

  ws.on("close", () => {
    console.log("WebSocket client disconnected. Total clients:", clients.size - 1);
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
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
  server.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
    console.log("WebSocket server running on ws://localhost:" + PORT);
  });
}

export { app, wss, broadcast };
