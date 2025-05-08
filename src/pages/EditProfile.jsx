import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import QuarterMasterToast from '../components/QuarterMasterToast';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  CircularProgress,
} from '@mui/material';

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentPicture, setCurrentPicture] = useState('');
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
          if (snapshot.exists()) {
            const profileData = snapshot.val();
            setCurrentPicture(profileData.profilePicture || '');
            setUsername(profileData.username || '');
            setAbout(profileData.about || '');
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_UNSIGNED_UPLOAD_PRESET);
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_NAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error.message);
      return data.secure_url;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast(<QuarterMasterToast message="Image upload failed." />);
      return '';
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let imageUrl = currentPicture;

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const updatedData = {
        profilePicture: imageUrl,
        username: username.trim(),
        about: about.trim(),
      };

      await update(ref(db, `users/${user.uid}`), updatedData);

      toast(<QuarterMasterToast message="Profile updated successfully!" />);
      navigate('/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast(<QuarterMasterToast message="Failed to update profile." />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        {currentPicture ? (
          <Avatar
            alt="Current Profile"
            src={currentPicture}
            sx={{ width: 150, height: 150 }}
          />
        ) : (
          <CircularProgress />
        )}
      </Box>

      <Box mb={3}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Update Username:
        </Typography>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Box>

      <Box mb={3}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Update About:
        </Typography>
        <TextField
          fullWidth
          label="About"
          value={about}
          multiline
          rows={3}
          onChange={(e) => setAbout(e.target.value)}
        />
      </Box>

      <Box mb={3}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Upload a new profile picture:
        </Typography>
        <Button variant="outlined" component="label">
          Choose File
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </Button>
      </Box>

      <Box mb={3}>
        {imageFile && (
          <Typography variant="body2">
            Selected file: {imageFile.name}
          </Typography>
        )}
      </Box>

      <Box display="flex" justifyContent="center" gap={2} mb={3}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
        <Button
          variant="outlined"
          component={Link}
          to="/profile"
        >
          Back
        </Button>
      </Box>
    </Container>
  );
}
