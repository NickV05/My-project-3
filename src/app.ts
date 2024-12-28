import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initializeDatabase } from "./db/database";
import apiRouter from "./routes/api";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CLIENT_URI || "*",
  })
);

initializeDatabase();

app.use("/api", apiRouter);

export default app;