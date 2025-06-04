import { posts, comments } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";

export const createComment = async (postId, userId, userName, content) => {
  let newComment = {
    fireId: userId,
    commentDate: validation.getFormatedDate(new Date()),
    userName: userName,
    content: content,
    postId: postId,
  };
  try {
    if (
      Object.values(newComment).some(
        (item) => item === undefined || item === null
      )
    ) {
      throw `Error: There are object missing for creating the comment.`;
    }

    postId = validation.checkId(postId);
    // userId = validation.checkId(userId);
    userName = validation.checkString(userName, "User Name");
    content = validation.checkString(content, "Content", {
      min: "2",
      max: "200",
    });
    const commentsCollection = await comments();
    const insertComment = await commentsCollection.insertOne(newComment);

    if (!insertComment) {
      throw "Error: Could not add comment";
    }

    const postCollection = await posts();
    const updatePost = await postCollection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $push: { commentList: insertComment.insertedId },
      }
    );

    if (!updatePost.modifiedCount) {
      throw "Error: Could not update the post with the new comment ID";
    }

    // return {
    //   commentSubmittedCompleted: true,
    //   commentId: insertComment.insertedId.toString(),
    // };
    return {
      ...newComment,
      _id: insertComment.insertedId,
    };
  } catch (e) {
    console.error("Error during comment creation:", e);
    throw e;
  }
};

export const getAllComments = async (postId) => {
  postId = validation.checkId(postId);

  const postCollection = await posts();
  const post = await postCollection.findOne(
    { _id: new ObjectId(postId) },
    { projection: { commentList: 1 } }
  );

  if (!post) throw `Error: no post exists with id: "${postId}"`;

  const commentIds = post.commentList;

  const commentsCollection = await comments();
  const commentsList = await commentsCollection
    .find({ _id: { $in: commentIds.map((id) => new ObjectId(id)) } })
    .toArray();

  return commentsList;
};

export const getComment = async (commentId) => {
  commentId = validation.checkId(commentId);
  const commentsCollection = await comments();
  const comment = await commentsCollection.findOne({
    _id: new ObjectId(commentId),
  });

  if (!comment) throw `Error: no comment exists with id: "${commentId}"`;

  return comment;
};

export const updateComment = async (commentId, updateObject) => {
  commentId = validation.checkId(commentId);
  let { content } = updateObject;
  const updateFields = {};

  const commentsCollection = await comments();

  if (content) {
    content = validation.checkString(content, "Content", {
      min: "2",
      max: "200",
    });
    updateFields["content"] = content;
  }

  updateFields["commentDate"] = validation.getFormatedDate(new Date());

  const updateCommentInfo = await commentsCollection.updateOne(
    { _id: new ObjectId(commentId) },
    { $set: updateFields }
  );

  if (!updateCommentInfo.matchedCount) {
    throw new Error(
      `Error: Update failed, could not find a comment with id of ${commentId}`
    );
  }

  const updatedComment = await commentsCollection.findOne({
    _id: new ObjectId(commentId),
  });
  if (!updatedComment) {
    throw new Error(
      `Error: Failed to retrieve the updated comment for comment id ${commentId}`
    );
  }

  return updatedComment;
};

export const removeComment = async (commentId) => {
  try {
    commentId = validation.checkId(commentId);
  } catch (e) {
    console.error("Error during comment deletion:", e);
    throw e;
  }

  try {
    const postCollection = await posts();

    const updatePostInfo = await postCollection.updateOne(
      { commentList: new ObjectId(commentId) },
      { $pull: { commentList: new ObjectId(commentId) } }
    );

    if (!updatePostInfo.modifiedCount) {
      throw `Error: Could not remove comment ID from post's commentList`;
    }

    const commentsCollection = await comments();
    const deleteInfo = await commentsCollection.deleteOne({
      _id: new ObjectId(commentId),
    });

    if (!deleteInfo.deletedCount) {
      throw `Error: Could not delete comment with id: ${commentId}`;
    }

    return { success: true };
  } catch (e) {
    console.error("Error during comment deletion:", e);
    throw e;
  }
};
