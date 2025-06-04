import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import "../pages/SignIn.css";
import { EditPost } from "./EditPost";
import { CommentsList } from "./CommentsList";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

export function Post({ post, onDelete }) {
  const { currentUser } = useContext(AuthContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Store index of current image

  const fireId = currentUser.uid;
  const id = post._id;

  const handleDelete = () => {
    onDelete(id);
  };

  const goToNextImage = () => {
    if (post.media && post.media.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % post.media.length); // Loop back to first image
    }
  };

  const goToPreviousImage = () => {
    if (post.media && post.media.length > 0) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex - 1 + post.media.length) % post.media.length
      ); // Loop back to last image
    }
  };
  return (
    <div className="post-card">
      <div className="post-info">
        <div className="image-slider">
          {post.media && post.media.length > 0 ? (
            <>
              {post.media[currentImageIndex].endsWith(".mp4") ? (
                // Video content
                <video
                  width="100%"
                  controls
                  key={currentImageIndex}
                  className="slider-image"
                >
                  <source
                    src={`http://localhost:3000${post.media[currentImageIndex]}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              ) : (
                // Image content
                <img
                  src={`http://localhost:3000${post.media[currentImageIndex]}`}
                  alt={post.title}
                  className="slider-image"
                />
              )}

              {/* Navigation buttons */}
              <button className="prev-btn" onClick={goToPreviousImage}>
                &lt;
              </button>
              <button className="next-btn" onClick={goToNextImage}>
                &gt;
              </button>
            </>
          ) : (
            <p>No media available for this post.</p>
          )}
        </div>
        <h2>{post.title}</h2>
        <p>{post.content}</p>
        <p>
          <strong>Location:</strong> {post.location}
        </p>
        <p>
          <strong>Category:</strong> {post.category}
        </p>
        <div className="button-container">
          <EditPost postId={id} />

          <IconButton onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </div>

        <CommentsList postId={id} userId={fireId} />
      </div>
    </div>
  );
}
