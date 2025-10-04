const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Ensure required environment variables are present
if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in Backend/.env. Please set your MongoDB Atlas connection string.");
  process.exit(1);
}

const sosRoutes = require("./routes/sos");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST", "PATCH", "DELETE"] },
});

app.use(cors());
app.use(express.json());
app.set("io", io);

app.use("/api/sos", sosRoutes);

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Campus Safety / SOS App (MERN) boilerplate generated.");
});
