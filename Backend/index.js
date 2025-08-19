const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

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
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/campus-safety")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Campus Safety / SOS App (MERN) boilerplate generated.");
});
