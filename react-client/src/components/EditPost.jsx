import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";

import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Post.css";
// import CommentsList from "./components/CommentsList";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
// import "../pages/SignIn.css";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
const categories = [
  "Adventure",
  "Cultural Experiences",
  "Leisure",
  "Nature",
  "Urban Exploration",
  "Wildlife",
  "Solo Travel",
  "Family Trips",
];

export function EditPost(props) {
  const { currentUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState("");
  const fireId = currentUser.uid;
  const username = currentUser.displayName;
  const id = props.postId;

  const handleChange = (event) => {
    setCategory(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const uploadData = new FormData();
    const title = formData.get("title")?.trim() ?? "";
    const content = formData.get("content")?.trim() ?? "";
    const location = formData.get("location")?.trim() ?? "";
    const category = formData.get("category");
    uploadData.append("title", title);
    uploadData.append("content", content);
    uploadData.append("location", location);
    uploadData.append("category", category);

    const files = event.currentTarget.photos.files;

    if (files.length > 0) {
      for (let i = 0; i < files.length && i < 5; i++) {
        uploadData.append("media", files[i]);
      }
    } else {
      uploadData.append("media", []);
    }

    console.log(uploadData);
    // /:postId/update
    const postUrl = `http://localhost:3000/api/posts/${id}/update`;
    try {
      const response = await fetch(postUrl, {
        method: "PUT",
        body: uploadData,
      });

      if (response.ok) {
        setError(false);
        setOpen(false);
        alert("Post Updated!");
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div>
      {/* <button onClick={handleClickOpen}>Edit</button> */}
      <IconButton onClick={handleClickOpen}>
        <EditIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleEdit,
        }}
      >
        <DialogTitle>Edit</DialogTitle>
        <DialogContent>
          <DialogContentText>Edit your post here</DialogContentText>
          {error && <p className="error-message">Please enter valid input</p>}
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Title"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            id="outlined-multiline-static"
            rows={4}
            name="content"
            label="Content"
            multiline
            variant="standard"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="location"
            name="location"
            label="Location"
            fullWidth
            variant="standard"
          />
          <FormControl variant="standard" sx={{ minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">
              Category
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={category}
              name="category"
              onChange={handleChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <input
            type="file"
            id="photos"
            name="photos"
            accept="image/*"
            multiple
          />
        </DialogContent>
        <DialogActions>
          <button onClick={handleClose}>Cancel</button>
          <button type="submit">Update</button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
