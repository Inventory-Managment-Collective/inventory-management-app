import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';

export default function Home() {
    const [user, setUser] = useState(null);
    
      const auth = getAuth();
    
      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser);
        });
    
        return () => unsubscribe();
      }, []);

    return (
        <div>
          <h1>Welcome to My Pantry App</h1>
          <p>Manage your ingredients and recipes.</p>
    
          <ul>
            <li><Link to="/recipes">View shared Recipes</Link></li>
            {user ? (
                    <li><Link to="/userRecipes">See your Recipes</Link></li>
                  ) : (
                    <></>
                  )}
            {user ? (
                    <li><Link to="/ingredients">See your Ingredients</Link></li>
                  ) : (
                    <></>
                  )}
          </ul>
        </div>
      );
}