import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from './routes/auth.routes.js'
import pollRoutes from "./routes/poll.routes.js";
import responseRoutes from './routes/response.routes.js'

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/responses", responseRoutes)

export default app;