const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const socketio = require("socket.io");
const userRouter = require("./routes/UserRoutes");
const socketIo = require("./socket");
const cors = require("cors");
const groupRouter = require("./routes/GroupRoutes");
const chatRouter = require("./routes/ChatRouter");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// Middlewares
app.use(cors());
app.use(express.json());

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Connection failed", err));

// Initialize
socketIo(io);

// Our routes
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", chatRouter);

// Start the server
const PORT = process.env.PORT || 8080;

server.listen(PORT, console.log(`Server is up and running on port ${PORT}`));
