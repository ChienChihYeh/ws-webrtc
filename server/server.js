import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import router from "./routes.js";
import { createSocket, setupSocket } from "./sockets.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.static("../client/dist"));
const server = createServer(app);
const io = createSocket(server);
setupSocket(io);

const error = (err, req, res) => {
  console.log(req, err);
  res.status(500).send("Internal Server Error");
};

app.use("/", router);
app.use(error);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
