import express from "express";
import {
  createComment,
  getAllComments,
  getComment,
  updateComment,
  removeComment,
} from "../data/comments.js"; // Import the functions from your comments data file
import validation from "../validation.js";
import redis from "redis";

const router = express.Router();
const client = redis.createClient({ url: "redis://localhost:6379" });

client.connect().catch((err) => console.error("Redis Client Error", err));

router
  .route("/:postId")
  .get(async (req, res) => {
    const { postId } = req.params;

    try {
      const cachedComments = await client.get(`comments:${postId}`);
      if (cachedComments) {
        // console.log("Comments fetched from Redis cache.");
        return res.status(200).json(JSON.parse(cachedComments));
      }

      const comments = await getAllComments(postId);
      await client.setEx(`comments:${postId}`, 3600, JSON.stringify(comments));

      res.status(200).json(comments);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  })
  .post(async (req, res) => {
    const { postId } = req.params;
    const { userId, userName, content } = req.body;

    try {
      validation.checkId(postId);
      validation.checkString(userName, "User Name");
      validation.checkString(content, "Content", { min: "2", max: "200" });

      const result = await createComment(postId, userId, userName, content);

      // Invalidate cache when new comment is added
      await client.del(`comments:${postId}`);

      res.status(201).json({
        message: "Comment created successfully",
        comment: result,
      });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

router.get("/comment/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await getComment(commentId);
    res.status(200).json(comment);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/comment/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    validation.checkString(content, "Content", { min: "2", max: "200" });

    const comment = await getComment(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const updatedComment = await updateComment(commentId, { content });

    await client.del(`comments:${comment.postId}`);

    res.status(200).json({
      message: "Comment updated successfully",
      updatedComment,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/comment/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    const commentToDelete = await getComment(commentId);

    if (!commentToDelete) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const postId = commentToDelete.postId;
    const deletedComment = await removeComment(commentId);

    await client.del(`comments:${postId}`);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
