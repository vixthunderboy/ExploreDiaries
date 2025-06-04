import { posts, users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";

export const createPost = async (
  userId,
  userName,
  title,
  content,
  media,
  category,
  location
) => {
  const postCollection = await posts();
  const userCollection = await users();

  try {
    // userId = validation.checkId(userId);
    userName = validation.checkString(userName, "User Name");
    title = validation.checkString(title, "Title", { min: 2, max: 100 });
    content = validation.checkString(content, "Content", {
      min: 10,
      max: 1000,
    });
    location = validation.checkString(location, "Location", {
      min: 2,
      max: 100,
    });
    category = validation.checkString(category, "Category");

    media = validation.checkArray(media, "Media");
    media = validation.checkMediaPath(media);

    const likes = 0;
    const commentList = [];
    const postDate = new Date().toISOString();

    const newPost = {
      userId,
      userName,
      title,
      content,
      media,
      category,
      location,
      postDate,
      likes,
      commentList,
    };

    let insertPost = await postCollection.insertOne(newPost);

    if (!insertPost) throw "Post could not be entered into the database";

    await userCollection.updateOne(
      { fireId: userId },
      { $push: { posts: insertPost.insertedId } }
    );

    return {
      ...newPost,
      _id: insertPost.insertedId,
    };
  } catch (e) {
    console.error("Error during post creation:", e);
    throw e;
  }
};

export const getAllPosts = async () => {
  try {
    const postCollection = await posts();

    let postList = await postCollection.find({}).toArray();

    if (!postList) throw "Could not get all posts";
    if (postList.length === 0) throw "No posts found";

    postList.forEach((post) => {
      post.id = post._id.toString();
    });

    return postList;
  } catch (e) {
    throw e;
  }
};

export const getPost = async (id) => {
  try {
    if (!id) throw "No Post ID given";
    id = validation.checkId(id);

    const postCollection = await posts();

    let idno = ObjectId.createFromHexString(id);
    const retrievedPost = await postCollection.findOne({ _id: idno });
    if (!retrievedPost) throw "Post could not be found";

    return retrievedPost;
  } catch (e) {
    throw e;
  }
};

export const updatePost = async (
  id,
  userId,
  userName,
  title,
  content,
  media,
  category,
  location,
  postDate
) => {
  const postCollection = await posts();

  id = validation.checkId(id);
  //   userId = validation.checkId(userId);
  userName = validation.checkString(userName, "User Name");
  title = validation.checkString(title, "Title", { min: 2, max: 100 });
  content = validation.checkString(content, "Content", { min: 10, max: 1000 });
  location = validation.checkString(location, "Location", { min: 2, max: 100 });
  media = validation.checkArray(media, "Media");
  category = validation.checkString(category, "Category");
  postDate = validation.checkString(postDate, "Post Date");

  media = validation.checkMediaPath(media);

  const updatedAt = new Date().toISOString();

  const updateFields = {
    userName,
    title,
    content,
    media,
    category,
    location,
    updatedAt,
    postDate,
  };

  let updatePost = await postCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateFields },
    { returnDocument: "after" }
  );

  if (!updatePost) throw "Post not found or update failed";

  return {
    updateFields,
  };
};

export const deletePost = async (id, userId) => {
  try {
    const postCollection = await posts();
    const userCollection = await users();

    try {
      id = validation.checkId(id);
    } catch (e) {
      console.error("Error during post ID delete:", e);
      throw e;
    }

    // try {
    // //   userId = validation.checkId(userId);
    // } catch (e) {
    //   console.error("Error during post USERID delete:", e);
    //   throw e;
    // }

    const deletePost = await postCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletePost) throw "Post could not be deleted";

    await userCollection.updateOne(
      { fireId: userId },
      { $pull: { posts: new ObjectId(id) } }
    );

    return {
      postDeleted: true,
      postId: id,
    };
  } catch (e) {
    throw e;
  }
};
