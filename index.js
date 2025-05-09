import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";

// import { connectDb } from "./blogServer/connectDb.js";
import authRoutes from "./routes/auth.routes.js";

import blogRoutes from "./routes/blog.routes";

import { verifyToken } from "./middleware/verifyToken";

import { connectDb } from "./connectDb.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "https://blogging-frontend-blue.vercel.app", // replace with your actual frontend URL
    credentials: true, // this allows cookies to be sent/received
  })
);

app.options("*", cors());

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

app.get("/test", function (req, res) {
  res.status(200).json({
    msg: "working successfully",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/blog", verifyToken, blogRoutes);

app.listen(process.env.PORT, function () {
  console.log("Listening on the port", process.env.PORT);
});
