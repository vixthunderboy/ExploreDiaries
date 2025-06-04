import { Router } from "express";
import {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
} from "../data/posts.js";
import multer from "multer";
import * as path from "path";
import fs from "fs";
import redis from "redis";
import { fileURLToPath } from "url";
import { Client } from "@elastic/elasticsearch";

const esClient = new Client({ node: "http://localhost:9200" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = redis.createClient({ url: "redis://localhost:6379" });
client.connect().catch((err) => console.error("Redis Client Error", err));

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const uploadDir = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const newFilename = uniqueSuffix + extension;
    callback(null, newFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: function (req, file, cb) {
    const lowercasedMimetype = file.mimetype.toLowerCase();
    if (
      !["image/jpeg", "image/jpg", "image/png", "video/mp4"].includes(
        lowercasedMimetype
      )
    ) {
      return cb(
        new Error("Invalid file type. Please upload a JPG, JPEG, PNG, or MP4"),
        false
      );
    }
    cb(null, true);
  },
});

const uploadMedia = upload.array("media", 5);

const checkMinMediaSize = (req, res, next) => {
  const minFileSize = 1024;

  if (req.files) {
    for (let file of req.files) {
      if (file.size < minFileSize) {
        return res.status(400).json({
          errors: "Photo too small, please select photos more than 1KB.",
        });
      }
    }
  }
  next();
};

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    const cachedPosts = await client.get("posts");
    if (cachedPosts) {
      return res.status(200).json(JSON.parse(cachedPosts));
    }

    const posts = await getAllPosts();
    await client.setEx("posts", 3600, JSON.stringify(posts));
    res.status(200).json(posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router
  .route("/addPost")
  .post(uploadMedia, checkMinMediaSize, async (req, res) => {
    const { userId, userName, title, content, category, location } = req.body;
    const media = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    try {
      const newPost = await createPost(
        userId,
        userName,
        title,
        content,
        media,
        category,
        location
      );

      await esClient
        .index({
          index: "posts",
          id: newPost._id.toString(),
          body: {
            title: newPost.title,
            content: newPost.content,
            category: newPost.category,
            location: newPost.location,
            media: newPost.media,
          },
        })
        .catch((err) => {
          console.error("Error indexing post to Elasticsearch:", err);
        });

      await esClient.indices.refresh({ index: "posts" });
      await client.del(`userPosts:${userId}`);
      await client.del("posts");
      res
        .status(201)
        .json({ message: "Post created successfully", post: newPost });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

router.route("/:postId").get(async (req, res) => {
  const { postId } = req.params;

  try {
    const cacheKey = `post:${postId}`;
    const cachedPost = await client.get(cacheKey);
    if (cachedPost) {
      return res.status(200).json(JSON.parse(cachedPost));
    }

    const post = await getPost(postId);
    await client.set(cacheKey, JSON.stringify(post));
    res.status(200).json(post);
  } catch (e) {
    res.status(404).json({ error: "Post not found" });
  }
});

router
  .route("/:postId/update")
  .put(upload.array("media", 5), async (req, res) => {
    const { postId } = req.params;
    const { title, content, category, location } = req.body;
    const media = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    try {
      const post = await getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const updatedPost = await updatePost(
        postId,
        post.userId,
        post.userName,
        title || post.title,
        content || post.content,
        media.length > 0 ? media : post.media,
        category || post.category,
        location || post.location,
        post.postDate
      );

      await esClient.update({
        index: "posts",
        id: postId,
        body: {
          doc: {
            title,
            content,
            category,
            location,
            media,
          },
        },
      });

      const cacheKey = `post:${postId}`;
      const userId = post.userId;
      await client.del(cacheKey);
      await client.del(`userPosts:${userId}`);
      await client.set(cacheKey, JSON.stringify(updatedPost));

      res.status(200).json({ postUpdated: true, postId: updatedPost.postId });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

router.route("/:postId/delete").delete(async (req, res) => {
  console.log("Request received at /delete", req.body);
  const postId = req.params.postId;
  console.log(postId);

  try {
    const post = await getPost(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const { postDeleted, deletedPostId } = await deletePost(
      postId,
      post.userId
    );

    if (postDeleted) {
      await esClient
        .delete({
          index: "posts",
          id: postId,
        })
        .catch((err) => {
          console.error("Error deleting post from Elasticsearch:", err);
        });

      const cacheKey = `post:${postId}`;
      const userCacheKey = `userPosts:${post.userId}`;
      await client.del(cacheKey);
      await client.del(userCacheKey);

      res
        .status(200)
        .json({ message: "Post deleted successfully", postId: deletedPostId });
    } else {
      res.status(400).json({ error: "Post deletion failed" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
