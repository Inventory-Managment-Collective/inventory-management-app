import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/logIn');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <nav>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <Link to="/profile">Profile</Link>
          <button onClick={handleLogout}>Log Out</button>
        </>
      ) : (
        <Link to="/logIn">Log In</Link>
      )}
    </nav>
  );
}