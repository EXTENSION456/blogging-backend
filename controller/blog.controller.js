import cloudinary from "../cloudinary/config.js";
import Blog from "../model/blog.model.js";
import { User } from "../model/user.model.js";

import { Readable } from "stream";

export const handleCreateBlog = async (req, res) => {
  const { title, summary, description } = req.body;

  const file = req.file;

  if (!title) {
    return res.status(400).json({
      success: "false",
      msg: "missing input fields",
    });
  }

  try {
    const userId = req.userId;

    const user = await User.findOne({
      _id: userId,
    });

    if (!user) {
      return res.status(400).json({
        success: "false",
        msg: "No such user. Please register before creating blog",
      });
    }

    const blog = new Blog({
      title,
      summary,
      description,
      user: userId,
    });

    if (!file) {
      await blog.save();
      res.status(200).json({
        success: "true",
        msg: "blog created successfully",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const upload_stream = cloudinary.uploader.upload_stream(
        {
          folder: "blogs",
          resource_type: "image",
        },
        (error, response) => {
          if (error) {
            reject(error);
          }
          resolve(response);
        }
      );
      Readable.from(file.buffer).pipe(upload_stream);
    });

    blog.imageUrl = uploadResult.secure_url;

    await blog.save();

    res.status(200).json({
      success: "true",
      msg: "blog created successfully",
    });
  } catch (error) {
    console.log(error, "error in creating blog");
    return res.status(400).json({
      success: "false",
      msg: "something's wrong",
    });
  }
};

export const handleDeleteBlog = async (req, res) => {
  const id = req.params.id;

  const userId = req.userId;

  try {
    const blog = await Blog.findOne({
      _id: id,
      user: userId,
    });

    if (!blog) {
      return res.status(400).json({
        success: "false",
        msg: "No blog found",
      });
    }

    await Blog.deleteOne({
      _id: id,
      user: userId,
    });

    return res.status(200).json({
      success: "true",
      msg: "blog deleted successfully",
    });
  } catch (error) {
    console.log(error, "error in deleting blog");
    return res.status(400).json({
      success: "false",
      msg: "something's wrong",
    });
  }
};

export const handleEditBlog = async (req, res) => {
  const { title, description, summary } = req.body;
  const id = req.params.id;
  const userId = req.userId;

  const file = req.file;
  try {
    const blog = await Blog.findOne({
      _id: id,
      user: userId,
    });

    if (!blog) {
      return res.status(400).json({
        success: "false",
        msg: "No blog found",
      });
    }

    if (!file) {
      const editedBlog = await Blog.findOneAndUpdate(
        {
          _id: id,
          user: userId,
        },
        {
          title: title,
          description: description,
          summary: summary,
        },
        { new: true }
      );

      return res.status(200).json({
        success: "true",
        msg: "blog edited successfully",
        blog: {
          ...editedBlog._doc,
          user: undefined,
        },
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const upload_stream = cloudinary.uploader.upload_stream(
        {
          folder: "blogs",
          resource_type: "image",
        },
        (error, response) => {
          if (error) {
            reject(error);
          }
          resolve(response);
        }
      );
      Readable.from(file.buffer).pipe(upload_stream);
    });

    const editedBlog = await Blog.findOneAndUpdate(
      {
        _id: id,
        user: userId,
      },
      {
        title: title,
        description: description,
        summary: summary,
        imageUrl: uploadResult.secure_url,
      },
      { new: true }
    );

    return res.status(200).json({
      success: "true",
      msg: "blog edited successfully",
      blog: {
        ...editedBlog._doc,
        user: undefined,
      },
    });
  } catch (error) {
    console.log(error, "error in handleEditBlog function");
    return res.status(400).json({
      success: "false",
      msg: "something's wrong",
    });
  }
};

export const handleGetParticularBlog = async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;

  try {
    const blog = await Blog.findOne({
      _id: id,
      user: userId,
    });

    if (!blog) {
      return res.status(404).json({
        success: "false",
        msg: "no such blog",
      });
    }

    return res.status(200).json({
      success: "true",
      msg: "blog found",
      blog: {
        ...blog._doc,
        user: undefined,
      },
    });
  } catch (error) {
    console.log(error, "error in handleGetParticularBlog");
    return res.status(400).json({
      success: "false",
      msg: "something's wrong",
    });
  }
};

export const handleGetAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({});
    return res.status(200).json({
      success: "true",
      msg: "blogs fetched successfully",
      blogs: blogs,
    });
  } catch (error) {
    console.log(error, "function handleGetAllBlogs error");
    return res.status(400).json({
      success: "false",
      msg: "something's wrong",
    });
  }
};

export const handleGetBlogFromUser = async (req, res) => {
  const userId = req.userId;

  try {
    const blog = await Blog.find({
      user: userId,
    });

    const sanitizedBlogs = blog.map((blog) => {
      const { user, ...rest } = blog._doc;
      return rest;
    });

    if (blog.length === 0) {
      return res.status(404).json({
        success: "false",
        msg: "no such blog",
      });
    }

    return res.status(200).json({
      success: "true",
      msg: "blog found",
      blog: {
        blog: sanitizedBlogs,
      },
    });
  } catch (error) {
    console.log(error, "error in handleGetBlogFromUser");
    return res.status(400).json({
      success: "false",
      msg: "something's wrong",
    });
  }
};
