import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref, set } from 'firebase/database';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link as MuiLink,
} from '@mui/material';
import { toast } from 'react-toastify';
import QuarterMasterToast from '../components/QuarterMasterToast';

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_UNSIGNED_UPLOAD_PRESET);
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_NAME);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleSignup = async () => {
    if (!email || !password || !username) return toast(<QuarterMasterToast message='Please enter both email and password.'/>);

    try {
      let imageUrl = '';

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userRef = ref(db, `users/${uid}`);
      await set(userRef, {
        email: email,
        username: username,
        profilePicture: imageUrl,
        about: about,
        ingredients: {},
        recipes: {}
      });
      toast(<QuarterMasterToast message='Account created!'/>)
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Sign Up
        </Typography>

        <Box component="form" noValidate>
        <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="About"
            variant="outlined"
            fullWidth
            margin="normal"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              Profile Picture
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={{ marginTop: 4 }}
            />
          </Box>
          <Button
            type="button"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleSignup}
          >
            Sign Up
          </Button>
        </Box>

        <MuiLink component={Link} to="/logIn" underline="hover" display="block" mt={2}>
          Back to Login
        </MuiLink>
      </Paper>
    </Box>
  );
}
