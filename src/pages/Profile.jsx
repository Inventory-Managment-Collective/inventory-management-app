import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link as RouterLink} from 'react-router-dom';
import { Link } from '@mui/material';

export default function Profile() {
   const [user, setUser] = useState(null);
       
         const auth = getAuth();
       
         useEffect(() => {
           const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
             setUser(firebaseUser);
           });
       
           return () => unsubscribe();
         }, []);
   
   
    return (
        <>
    {user ? (
      <p>{user.email}</p>
    ) : (
      <p>Loading profile...</p>
    )}
  </>
    )
}