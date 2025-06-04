import { ObjectId } from "mongodb";
import { posts, users } from "../config/mongoCollections.js";

export const addUser = async (name, email, fireId) => {
  if (!name || !email || !fireId) {
    throw "Must provide valid user name or email or fireId";
  }
  const usersCollection = await users();
  const userExsit = await usersCollection.findOne({ fireId: fireId });

  if (userExsit) {
    throw "User already exists.";
  }

  const newUser = {
    _id: new ObjectId(),
    fireId: fireId,
    name: name,
    email: email,
    posts: [],
  };

  const addNew = await usersCollection.insertOne(newUser);
  if (!addNew) {
    throw "Cannot Add New User";
  }

  return newUser;
};

export const editUser = async (name, fireId) => {
  name = name.trim();
  if (!name || name.length === 0) {
    throw "Please provide valid name";
  }

  const usersCollection = await users();

  const updatedUser = await usersCollection.findOneAndUpdate(
    { fireId: fireId },
    { $set: { name: name } },
    { returnDocument: "after" }
  );

  // console.log(updatedUser);

  if (!updatedUser) throw "Could not update user";

  return updatedUser;
};

export const getPostsByUser = async (userId) => {
  const postsCollection = await posts();
  const usersCollection = await users();

  const userData = await usersCollection.findOne({
    fireId: String(userId),
  });
  if (!userData) throw "User not found";
  // console.log(userData);

  const postsByUser = await postsCollection
    .find({ userId: userData.fireId })
    .toArray();

  return postsByUser;
};
