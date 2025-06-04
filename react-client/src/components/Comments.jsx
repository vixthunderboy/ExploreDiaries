// rendering individual comments
import { useState, useContext } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { AuthContext } from "../context/AuthContext";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
function Comments({ comment, onDelete, onEdit }) {
  const { currentUser } = useContext(AuthContext);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = () => {
    onDelete(comment._id);
  };
  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    const content = formJson.content.trim();
    onEdit(comment._id, content);
    setEditOpen(false);
  };

  return (
    <div>
      {currentUser && currentUser.uid === comment.fireId && (
        <div className="button-container">
          {/* <button onClick={handleEditOpen}>Edit</button> */}
          <IconButton onClick={handleEditOpen}>
            <EditIcon />
          </IconButton>
          <Dialog
            open={editOpen}
            onClose={handleEditClose}
            PaperProps={{
              component: "form",
              onSubmit: handleSubmit,
            }}
          >
            <DialogTitle>Edit Comment</DialogTitle>
            <DialogContent>
              <DialogContentText>Edit your comment here.</DialogContentText>
              <TextField
                autoFocus
                required
                margin="dense"
                id="content"
                name="content"
                label="Content"
                fullWidth
                // value={editedText}
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose}>Cancel</Button>
              <Button type="submit">Edit</Button>
            </DialogActions>
          </Dialog>
          {/* <button onClick={handleDelete}>Delete</button> */}
          <IconButton onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
}

export default Comments;
