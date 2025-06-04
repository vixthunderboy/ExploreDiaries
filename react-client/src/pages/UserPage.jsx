import SideBar from "../components/SideBar";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Post } from "../components/Post";
import "./UserPage.css";
import { AddPost } from "../components/AddPost";

export function UserPage() {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const fetchPosts = async () => {
        try {
          const fireId = currentUser.uid;
          const response = await fetch(
            `http://localhost:3000/api/auth/userId/${fireId}`
          );
          const data = await response.json();
          setPosts(data);
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };

      fetchPosts();
    }
  }, []);

  const handleDelete = async (id) => {
    const url = `http://localhost:3000/api/posts/${id}/delete`;

    try {
      const response = await fetch(url, {
        method: "DELETE", // HTTP method
        headers: {
          Accept: "application/json", // Expect JSON response
          "Accept-Language": "en-US,en;q=0.8",
          "Content-Type": "application/json", // Sending JSON content
        },
      });
      if (response.ok) {
        setPosts(posts.filter((post) => post._id !== id));
        alert("Post Deleted!");
      }
    } catch (e) {
      alert(e);
    }
  };

  if (!currentUser) {
    return (
      <div className="main-content">
        <h2>You are not logged in</h2>
      </div>
    );
  }
  const fireId = currentUser.uid;
  return (
    <div className="main-content">
      <div>
        <SideBar />
      </div>
      <div>
        <AddPost setPosts={setPosts} posts={posts} />
      </div>

      <div className="post-list">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Post onDelete={handleDelete} key={post._id} post={post} />
          ))
        ) : (
          <div>
            <p>You don't have any posts yet.</p>
            <p>Let't create one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
