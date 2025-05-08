import express from "express";
import {
  handleCreateBlog,
  handleEditBlog,
  handleDeleteBlog,
  handleGetAllBlogs,
  handleGetParticularBlog,
  handleGetBlogFromUser,
  // blogImageUpload,
} from "../controller/blog.controller.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post("/create", upload.single("imageUrl"), handleCreateBlog);

router.put("/edit/:id", upload.single("imageUrl"), handleEditBlog);

router.delete("/delete/:id", handleDeleteBlog);

router.get("/all", handleGetAllBlogs);

router.get("/:id", handleGetParticularBlog);

router.get("/", handleGetBlogFromUser);

export default router;
