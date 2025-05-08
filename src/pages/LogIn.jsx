import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
  Paper,
} from '@mui/material';

import { toast } from 'react-toastify';
import QuarterMasterToast from '../components/QuarterMasterToast';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast(<QuarterMasterToast message='Please enter both email and password.'/>);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast(<QuarterMasterToast message='Logged in!'/>)
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <MuiLink component={Link} to="/signUp" underline="hover">
          Don't have an account? Sign Up
        </MuiLink>

        <Box component="form" onSubmit={handleLogin} mt={2}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Log In
          </Button>
        </Box>

        <MuiLink component={Link} to="/" underline="hover" display="block" mt={2}>
          Back to Home
        </MuiLink>
      </Paper>
    </Box>
  );
}