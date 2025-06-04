import { createPost } from "../data/posts.js";
import { createComment } from "../data/comments.js";
import { addUser } from "../data/auth.js";
import { Client } from "@elastic/elasticsearch";
import {
  posts,
  comments,
  users as usersDb,
} from "../config/mongoCollections.js";

const esClient = new Client({ node: "http://localhost:9200" });
const indexName = "posts";
async function checkIndexExists() {
  const { body: exists } = await esClient.indices.exists({ index: indexName });
  return exists;
}

async function createIndex() {
  const indexExists = await checkIndexExists();
  if (!indexExists) {
    await esClient.indices.create({
      index: indexName,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
        },
        mappings: {
          properties: {
            field1: { type: "text" },
            field2: { type: "keyword" },
          },
        },
      },
    });
    console.log(`index ${indexName} created successfully`);
  } else {
    console.log(`index ${indexName} already exists`);
  }
}
createIndex().catch(console.error);

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const categoryList = [
  "Adventure",
  "Cultural Experiences",
  "Leisure",
  "Nature",
  "Urban Exploration",
  "Wildlife",
  "Solo Travel",
  "Family Trips",
];

const media = [
  "/uploads/post1-1.jpg",
  "/uploads/post1-2.jpg",
  "/uploads/post1-3.jpg",
];
const mediaPost2 = ["/uploads/post2-1.jpg", "/uploads/post2-2.jpg"];
const mediaPost3 = ["/uploads/post3-1.jpg", "/uploads/post3-2.jpg"];
const mediaPost4 = ["/uploads/post4-1.jpg", "/uploads/post4-2.mp4"];

const firebaseUsers = [
  {
    name: "vearwhyj@test.com",
    email: "vearwhyj@test.com",
    fireId: "JEDXwVOeQ9aiY1NsygtPkInfEMD3",
  },
  {
    name: "wouxryx1234@test.com",
    email: "wouxryx1234@test.com",
    fireId: "FcVkzwCULsPtLwDsfL8G0ULSKWl1",
  },
  {
    name: "wouxryx123@test.com",
    email: "wouxryx123@test.com",
    fireId: "TDTr4KlRwOOkY5CjaZYNWP1nPY73",
  },
  {
    name: "wsiiiii@test.com",
    email: "wsiiiii@test.com",
    fireId: "6UDdi0OM6oTpKS6Sg60y8s5J7242",
  },
  {
    name: "wourbo@test.com",
    email: "wourbo@test.com",
    fireId: "jpY0xVfoQFZfOy6ZXfpw6AzLLwh2",
  },
  {
    name: "bbetg@test.com",
    email: "bbetg@test.com",
    fireId: "8snreb4BNyfFiYf0Bigl6XvPqYd2",
  },
  {
    name: "66wwer8@test.com",
    email: "66wwer8@test.com",
    fireId: "ljc0m5ncfPaHeWjWZwOPkS9QbtG3",
  },
  {
    name: "66678@test.com",
    email: "66678@test.com",
    fireId: "rf5ehjk35BM57ESNj9UXJfwBGjS2",
  },
  {
    name: "123@test.com",
    email: "123@test.com",
    fireId: "U5YGcQC5YES4Be4rTx37QLTwrll1",
  },
];

const users = firebaseUsers.map((user) => {
  const username = user.name.split("@")[0] + randomInt(1, 100);
  return { _id: user.fireId, name: username };
});

const postsData = [
  {
    title: "Exploring Bled, Slovenia",
    content:
      "Bled is famous for its beautiful lake, surrounded by mountains, with a castle perched high on a cliff.",
    location: "Bled, Slovenia",
    media: media,
    category: "Nature",
  },
  {
    title: "A Day at the Grand Canyon",
    content:
      "The Grand Canyon offers breathtaking views, vast landscapes, and thrilling hikes along its edges.",
    location: "Grand Canyon, USA",
    media: mediaPost2,
    category: "Adventure",
  },
  {
    title: "Cultural Delights of Kyoto, Japan",
    content:
      "Kyoto is known for its rich cultural heritage, including beautiful temples, gardens, and traditional tea houses.",
    location: "Kyoto, Japan",
    media: mediaPost3,
    category: "Cultural Experiences",
  },
  {
    title: "Majestic Landscapes of Iceland",
    content:
      "Iceland’s geothermal features, waterfalls, and glaciers make it a unique and unforgettable destination.",
    location: "Iceland",
    media: [],
    category: "Nature",
  },
  {
    title: "The Wonders of Paris",
    content:
      "The Eiffel Tower, Louvre Museum, and beautiful boulevards make Paris an iconic destination for art and history lovers.",
    location: "Paris, France",
    media: mediaPost4,
    category: "Cultural Experiences",
  },
];

const commentsData = [
  {
    postTitle: "Exploring Bled, Slovenia",
    commentContent: "This place looks stunning! Can't wait to visit!",
  },
  {
    postTitle: "A Day at the Grand Canyon",
    commentContent: "The Grand Canyon is on my bucket list! Great review!",
  },
  {
    postTitle: "Cultural Delights of Kyoto, Japan",
    commentContent:
      "I've always wanted to visit Kyoto! The temples are so beautiful.",
  },
  {
    postTitle: "Majestic Landscapes of Iceland",
    commentContent:
      "Iceland looks like an adventure paradise. I hope to visit soon!",
  },
  {
    postTitle: "The Wonders of Paris",
    commentContent: "Paris is always a good idea! Love the description!",
  },
];

const generateSeedData = async () => {
  try {
    const postsCollection = await posts();
    const commentsCollection = await comments();
    const usersCollection = await usersDb();

    await postsCollection.deleteMany({});
    await commentsCollection.deleteMany({});
    await usersCollection.deleteMany({});

    console.log("Cleared existing data from MongoDB");

    await esClient.deleteByQuery({
      index: "posts",
      body: {
        query: {
          match_all: {},
        },
      },
    });

    console.log("Cleared existing data from Elasticsearch");

    const createdUsers = [];
    for (let i = 0; i < firebaseUsers.length; i++) {
      const user = firebaseUsers[i];
      const username = users[i].name;
      const createdUser = await addUser(username, user.email, user.fireId);
      createdUsers.push(createdUser);
      console.log(`Created user: ${createdUser.name}`);
    }

    for (let i = 0; i < postsData.length; i++) {
      const post = postsData[i];
      const user = createdUsers[i % createdUsers.length];
      const userIdAsString = user._id.toString();

      const newPost = await createPost(
        userIdAsString,
        user.name,
        post.title,
        post.content,
        post.media,
        post.category,
        post.location
      );
      console.log(`Created post: ${newPost.title}`);

      await esClient.index({
        index: "posts",
        id: newPost._id.toString(),
        body: {
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          location: newPost.location,
          media: newPost.media,
        },
      });
      console.log(`Indexed post in Elasticsearch: ${newPost.title}`);

      for (const comment of commentsData) {
        if (comment.postTitle === post.title) {
          const randomUser =
            createdUsers[randomInt(0, createdUsers.length - 1)];
          const userIdAsString = randomUser._id.toString();
          const newComment = await createComment(
            newPost._id.toString(),
            userIdAsString,
            randomUser.name,
            comment.commentContent
          );
          console.log(`Created comment: ${newComment.content}`);
        }
      }
    }

    console.log("Seed data inserted successfully!");
    process.exit();
  } catch (error) {
    console.error("Error inserting seed data:", error);
    process.exit();
  }
};

generateSeedData();
