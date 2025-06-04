import React, { useState, useEffect, useContext } from "react";

import CommentForm from "./CommentForm";
import { AuthContext } from "../context/AuthContext";
import Comments from "./Comments";

export function CommentsList(props) {
  const [comments, setComments] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const postId = props.postId;

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/comments/${postId}`
        );
        const data = await response.json();
        // console.log(data);
        if (!data) {
          setComments([]);
          return;
        }
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }
    fetchComments();
  }, [postId]);

  const addComment = async (postId, text, authorName, userId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            userName: authorName,
            content: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const newComment = await response.json();
      console.log(newComment.comment);
      setComments((prevComments) => [...prevComments, newComment.comment]);
    } catch (error) {
      console.error("Error adding comment", error.message);
      alert("Failed to add comment. Please try again.");
    }
  };

  const editComment = async (id, content) => {
    try {
      await fetch(`http://localhost:3000/api/comments/comment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const updatedComments = comments.map((comment) => {
        if (comment._id === id) {
          return { ...comment, content };
        }
        return comment;
      });
      setComments(updatedComments);
    } catch (error) {
      console.error("Error editing comment", error.message);
      alert("Failed to edit comment. Please try again.");
    }
  };

  const deleteComment = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/comments/comment/${id}`, {
        method: "DELETE",
      });
      setComments(comments.filter((comment) => comment._id !== id));
    } catch (error) {
      console.error("Error deleting comment", error.message);
      alert("Failed to delete comment. Please try again.");
    }
  };

  return (
    <div>
      <h4>Comments:</h4>
      {comments.length > 0 &&
        comments.map((comment) => (
          <div key={comment._id}>
            <p className="comment-p" key={comment._id}>
              {comment.content}
            </p>
            <Comments
              comment={comment}
              onEdit={editComment}
              onDelete={deleteComment}
            />
          </div>
        ))}

      {currentUser ? (
        <div>
          <CommentForm
            postId={postId}
            onSave={addComment}
            userId={currentUser.uid}
          />
        </div>
      ) : (
        <p>Please log in to leave a comment</p>
      )}
    </div>
  );
}
