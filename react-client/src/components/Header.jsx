import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import SignOut from "./SignOut";

export function Header() {
  //   const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleUsernameClick = () => {
    navigate(`/userpage`); // Navigate to the UserPage using the username
  };
  return (
    <header className="header">
      <div className="header-container">
        <a href="/">
          <h1>Explore Diaries</h1>
        </a>

        {/* Conditionally render Sign In/Sign Up buttons or username */}
        {currentUser ? (
          <div className="auth-buttons">
            <a href="/userpage">
              <button>
                {currentUser.displayName || currentUser.email}{" "}
                {/* Display username */}
              </button>
            </a>
            <SignOut /> {/* Use SignOut component for logging out */}
          </div>
        ) : (
          <div className="auth-buttons">
            <a href="/login">
              <button>Sign In</button>
            </a>
            <a href="/signup">
              <button>Sign Up</button>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
