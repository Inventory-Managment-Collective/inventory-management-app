import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref, push, set } from 'firebase/database';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please enter both email and password");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) return alert("Please enter both email and password");
  
    try {
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
       
      const userRef = ref(db, `users/${uid}`);
      await set(userRef, {
        email: email,
        ingredients: {},
        recipes: {}
      });
  
      alert("Account created!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };



  const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!name || !quantity || !unit || !category) {
        alert('Please fill in all fields.');
        return;
      }
  
      const newIngredient = {
        name,
        quantity: parseFloat(quantity),
        unit,
        category,
      };
  
      try {
        const ingredientsRef = ref(db, 'ingredients');
        const newRef = push(ingredientsRef);
        await set(newRef, newIngredient);
        alert('Ingredient added!');
        navigate('/ingredients');
      } catch (error) {
        console.error('Error adding ingredient:', error);
        alert('Failed to add ingredient.');
      }
    };

  return (
    <div>
      <h2>Login or Sign Up</h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Log In</button>
        <button type="button" onClick={handleSignup}>Sign Up</button>
      </form>
    </div>
  );
}