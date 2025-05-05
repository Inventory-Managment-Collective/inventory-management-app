import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

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
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) return alert("Please enter both email and password");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
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