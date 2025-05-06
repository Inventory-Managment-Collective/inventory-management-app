import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };


  return (
    <div>
      <h2>Login</h2>
      <Link to="/signUp">Sign Up</Link>
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
      </form>
      <br />
      <Link to="/">Back</Link>
    </div>
  );
}