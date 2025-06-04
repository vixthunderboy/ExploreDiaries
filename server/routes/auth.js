import { Router } from "express";
import { addUser, editUser } from "../data/auth.js";
import { getPostsByUser } from "../data/auth.js";
import redis from "redis";

const router = Router();
const client = redis.createClient({ url: "redis://localhost:6379" });

client.connect().catch((err) => console.error("Redis Client Error", err));

router.route("/signup").post(async (req, res) => {
  console.log("Request received at /signup:", req.body);
  const userInfo = req.body;
  const userName = userInfo.name;
  const userEmail = userInfo.email;
  const userId = userInfo.fireId;

  try {
    const addInfo = await addUser(userName, userEmail, userId);
    return res.json(addInfo);
  } catch (e) {
    return res.status(404).json({ error: e });
  }
});

router.route("/").patch(async (req, res) => {
  console.log("Request received at /", req.body);
  const userInfo = req.body;
  const userName = userInfo.name;
  const fireId = userInfo.fireId;

  try {
    const update = await editUser(userName, fireId);
    return res.json(update);
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

router.route("/userId/:id").get(async (req, res) => {
  const userId = req.params.id;

  try {
    const cacheKey = `userPosts:${userId}`;
    const cachedPost = await client.get(cacheKey);
    if (cachedPost) {
      return res.status(200).json(JSON.parse(cachedPost));
    }

    const posts = await getPostsByUser(userId);

    await client.set(cacheKey, JSON.stringify(posts));
    res.status(200).json(posts);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

export default router;
