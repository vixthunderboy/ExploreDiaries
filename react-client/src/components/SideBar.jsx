import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { CiEdit } from "react-icons/ci";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { TbLockPassword } from "react-icons/tb";
import "./Sidebar.css"; // Import the CSS file
import {
  doChangeName,
  doChangePassword,
  doSignOut,
} from "../firebase/FirebaseFunctions";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "react-router-dom";
import SignOut from "./SignOut";

export default function SideBar() {
  // const userName = props.userName;
  const { currentUser } = useContext(AuthContext);
  const [pwError, setPwError] = useState(false);
  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [error, setError] = useState(false);
  const username = currentUser.displayName;
  const navigate = useNavigate();

  const fireId = currentUser.uid;
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePwOpen = () => {
    setPwOpen(true);
  };

  const handlePwClose = () => {
    setPwOpen(false);
  };

  const handlePwSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    let newPw = formJson.newPassword;
    let confirm = formJson.confirmPw;
    let oldpw = formJson.oldPw;

    if (newPw !== confirm) {
      setPwError(true);
    }

    setPwError(false);

    try {
      await doChangePassword(currentUser.email, oldpw, newPw);
      alert("Password has been changed, you will now be logged out");
      navigate("/");
    } catch (e) {
      alert(error);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    let name = formJson.name;
    name = name.trim();
    if (name.length === 0) {
      setError(true);
    }

    try {
      await doChangeName(name);
      const postUrl = "http://localhost:3000/api/auth";

      const response = await fetch(postUrl, {
        method: "PATCH",
        headers: {
          Accept: "application/json", // Expect JSON response
          "Content-Type": "application/json", // Send JSON request
        },
        body: JSON.stringify({ name: name, fireId: fireId }),
      });

      if (response.ok) {
        setOpen(false);
      } else {
        alert("cannot change user name ");
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <nav className="sidebar-container">
      <div className="sidebar-content">
        <div className="avatar-container">
          <Stack direction="row" spacing={2}>
            <Avatar
              style={{ width: 100, height: 100 }}
              alt={username}
              src="user-page/src/assets/react.svg"
            />
          </Stack>
        </div>
        <div className="username-container">
          <p>{username}</p>
        </div>

        <div className="menu-container">
          <ul className="menu-list">
            <li>
              <a className="menu-item">
                <div className="icon-container">
                  <CiEdit />
                </div>
                <div>
                  <p onClick={handleClickOpen}>Edit Profile</p>
                  <Dialog
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                      component: "form",
                      onSubmit: handleProfileSubmit,
                    }}
                  >
                    <DialogTitle>Edit</DialogTitle>
                    <DialogContent>
                      <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Name"
                        fullWidth
                        variant="standard"
                        required
                      />
                    </DialogContent>
                    <DialogActions>
                      <button onClick={handleClose}>Cancel</button>
                      <button type="submit">Update</button>
                    </DialogActions>
                  </Dialog>
                </div>
              </a>
            </li>

            <li>
              <a className="menu-item" onClick={handlePwOpen}>
                <div className="icon-container">
                  <TbLockPassword />
                </div>
                <div>Change Password</div>
              </a>
            </li>
          </ul>

          <ul className="menu-list">
            <li>
              <div className="icon-container"></div>
              <div>
                <SignOut />
              </div>
              <Dialog
                open={pwOpen}
                onClose={handlePwClose}
                PaperProps={{
                  component: "form",
                  onSubmit: handlePwSubmit,
                }}
              >
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="oldPw"
                    name="oldPw"
                    label="Old Password"
                    fullWidth
                    variant="standard"
                    required
                    type="password"
                  />
                  <TextField
                    autoFocus
                    margin="dense"
                    id="newPassword"
                    name="newPassword"
                    label="New Password"
                    fullWidth
                    variant="standard"
                    required
                    type="password"
                  />
                  <TextField
                    autoFocus
                    margin="dense"
                    id="confirmPw"
                    name="confirmPw"
                    label="Confirm New Password"
                    fullWidth
                    type="password"
                    variant="standard"
                    required
                  />
                  {pwError && <p>Passwords do not match</p>}
                </DialogContent>
                <DialogActions>
                  <button onClick={handlePwClose}>Cancel</button>
                  <button type="submit">Update</button>
                </DialogActions>
              </Dialog>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
