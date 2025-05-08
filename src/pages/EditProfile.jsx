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

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let imageUrl = currentPicture;

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      await update(ref(db, `users/${user.uid}`), {
        profilePicture: imageUrl,
      });
      toast(<QuarterMasterToast message='Profile picture updated'/>)
      navigate('/profile');
    } catch (err) {
      toast(<QuarterMasterToast message='Failed to update profile picture: '/>)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile Picture
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
          Upload a new profile picture:
        </Typography>
        <TextField
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          fullWidth
        />
      </Box>

      <Box display="flex" justifyContent="center" gap={2} mb={3}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update'}
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
