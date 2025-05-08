import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import { ref, get, remove } from 'firebase/database';
import { db } from '../firebase';

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


  return (
    <>
      {user && userProfile ? (
        <div>
          <p>{user.username}</p>
          <p>{user.email}</p>
          {userProfile.profilePicture ? (
            <img
              src={userProfile.profilePicture}
              alt="Profile"
              style={{ width: '150px', height: '150px', borderRadius: '50%' }}
            />
          ) : (
            <p>No profile picture uploaded.</p>
          )}
          <br/>
          <Link component={RouterLink} to="/editProfile">
            Edit Profile
          </Link>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </>
  );
}