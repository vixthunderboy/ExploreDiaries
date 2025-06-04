import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import "./postpage.css";
import { EditPost } from "../components/EditPost";
import { AuthContext } from "../context/AuthContext";
import SignOut from "../components/SignOut"; // Import SignOut component
import { CommentsList } from "../components/CommentsList";

const PostPage = () => {
  const { postId } = useParams(); // Extract postId from the URL
  const [post, setPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Manage modal visibility
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Store index of current image

  const { currentUser } = useContext(AuthContext); // Get currentUser from AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    if (!postId) {
      console.error("No postId found in URL!");
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:9200/posts/_doc/${postId}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data._source) {
            setPost(data._source); // Set the fetched post data
          } else {
            console.error("Post not found");
          }
        } else {
          console.error("Error fetching post:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  if (!post) return <p>Loading...</p>;

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleUsernameClick = () => {
    navigate(`/userpage`); // Navigate to the UserPage using the username
  };

  // Handle opening the edit modal
  const handleEditPost = () => {
    setIsEditModalOpen(true);
  };

  // Handle closing the edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Check if the currentUser is the author of the post
  const isAuthor = currentUser && currentUser.uid === post.userId;

  // Image slider navigation
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
    <div className="main-content">
      <div className="post-page">
        {/* Post Details */}
        <h2>{post.title}</h2>

        {/* Image Slider */}
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

        <p>{post.content}</p>
        <p>
          <strong>Location:</strong> {post.location}
        </p>
        <p>
          <strong>Category:</strong> {post.category}
        </p>

        <div>
          <CommentsList postId={postId} />
        </div>

        {/* Action buttons */}
        <div className="post-actions">
          {/* Only show Edit button if the currentUser is the author */}
          {isAuthor && !isEditModalOpen && (
            <button className="edit-post-btn" onClick={handleEditPost}>
              Edit
            </button>
          )}
          <button className="back-home-btn" onClick={() => navigate("/")}>
            Back to Home Page
          </button>
        </div>

        {/* Conditionally render EditPost as a modal */}
        {isEditModalOpen && (
          <EditPost
            postId={postId}
            postData={post}
            handleClose={handleCloseEditModal}
          />
        )}
      </div>
    </div>
  );
};

export default PostPage;
