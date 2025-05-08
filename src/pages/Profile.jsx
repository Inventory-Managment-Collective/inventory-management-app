import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link as RouterLink } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

import {
  Box,
  Typography,
  Avatar,
  Grid,
  Link,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
          if (snapshot.exists()) {
            setUserProfile(snapshot.val());
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user || !userProfile) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Hello, {userProfile.username}!
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={userProfile.profilePicture}
              alt="Profile"
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Typography variant="subtitle1" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          {userProfile.about && (
            <>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body1">{userProfile.about}</Typography>
            </>
          )}
        </Grid>
      </Grid>

      <Box mt={4}>
        <Link component={RouterLink} to="/editProfile" variant="button">
          Edit Profile
        </Link>
      </Box>
    </Paper>
  );
}
