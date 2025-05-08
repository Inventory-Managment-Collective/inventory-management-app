import React, { useState, useEffect } from "react";
import { ref, get, push, set } from "firebase/database";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

export default function Comments({ recipeId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsRef = ref(db, `comments/${recipeId}`);
        const snapshot = await get(commentsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const formattedComments = Object.entries(data).map(([id, value]) => ({
            id,
            ...value,
          }));
          setComments(formattedComments);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [recipeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to leave a comment.");
      return;
    }

    if (newComment.trim() === "") return;

    const commentData = {
      text: newComment,
      user: user.displayName || "Anonymous",
      timestamp: Date.now(),
    };

    try {
      const commentsRef = ref(db, `comments/${recipeId}`);
      const newCommentRef = push(commentsRef);
      await set(newCommentRef, commentData);

      setComments((prev) => [
        ...prev,
        { id: newCommentRef.key, ...commentData },
      ]);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>

      <List sx={{ mb: 2 }}>
        {comments.length === 0 ? (
          <Typography>No comments yet.</Typography>
        ) : (
          comments.map((comment) => (
            <React.Fragment key={comment.id}>
              <ListItem>
                <ListItemText
                  primary={comment.text}
                  secondary={`By ${comment.user}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {user ? (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Leave a comment"
            variant="outlined"
            fullWidth
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </form>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Log in to leave a comment.
        </Typography>
      )}
    </Box>
  );
}
