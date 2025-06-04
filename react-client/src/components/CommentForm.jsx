//form used to submit new comments

import React, { useState } from "react";

function CommentForm({ postId, onSave, userId }) {
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!userId) {
      alert("You must be logged in to post comments.");
      return;
    }
    onSave(postId, text, authorName, userId);
    setText("");
    setAuthorName("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Your name"
        required
      />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        required
      />
      <button type="submit">Post Comment</button>
    </form>
  );
}

export default CommentForm;
