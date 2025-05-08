import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";

import { connectDb } from "./connectDb.js";
import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import { verifyToken } from "./middleware/verifyToken.js";

dotenv.config();
const app = express();

app.use(cors());

//connection with db
connectDb(process.env.MONGO_URI)
  .then(function () {
    console.log("connected with db");
  })
  .catch(function (err) {
    console.log("not connected with db", err);
  });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);

app.use("/api/blog", verifyToken, blogRoutes);

app.listen(process.env.PORT, function () {
  console.log("Listening on the port", process.env.PORT);
});
