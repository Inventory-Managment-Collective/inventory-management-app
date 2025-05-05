import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {


    return (
        <div>
          <h1>Welcome to My Pantry App</h1>
          <p>Manage your ingredients and recipes.</p>
    
          <ul>
            <li><Link to="/ingredients">View Ingredients</Link></li>
            <li><Link to="/recipes">View Recipes</Link></li>
          </ul>
        </div>
      );
}