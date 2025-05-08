import mongoose, { mongo } from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    required: true,
    type: String,
  },
  summary: {
    type: String,
  },
  description: {
    type: String,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  imageUrl: {
    type: String,
  },
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
