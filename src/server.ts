import dotenv from "dotenv";
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";

dotenv.config();

let server: Server;

const startServer = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error("DB_URL environment variable is not defined");
    }
    await mongoose.connect(process.env.DB_URL);

    console.log("Connected to MongoDB!!");

    server = app().listen(process.env.PORT, () => {
      console.log(`Server is listening to port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
