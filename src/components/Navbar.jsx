import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { ref, get, remove } from 'firebase/database';
import { db } from '../firebase';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';

const pages = [
  { label: 'Recipes', path: '/recipes' },
  { label: 'Your Recipes', path: '/UserRecipes' },
  { label: 'Ingredients', path: '/ingredients' },
];

const settings = [
  { label: 'Profile', path: '/profile' },
  { label: 'Logout', action: 'logout' }
];

function ResponsiveAppBar() {
  const [user, setUser] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [userProfile, setUserProfile] = React.useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
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


  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSettingClick = async (setting) => {
    handleCloseUserMenu();
    if (setting.action === 'logout') {
      try {
        await signOut(auth);
        navigate('/logIn');
      } catch (err) {
        alert(err.message);
      }
    } else if (setting.path) {
      navigate(setting.path);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: '100%',
        top: 0,
        left: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ position: 'relative', minHeight: '64px' }}>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <AdbIcon sx={{ color: 'white', mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                '&:hover': { color: 'secondary.main' },
              }}
            >
              Quartermaster
            </Typography>
          </Link>
        </Box>


        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            gap: 2,
          }}
        >
          {pages.map((page) => {
            const isActive = location.pathname === page.path;
            return (
              <Button
                key={page.label}
                component={Link}
                to={page.path}
                sx={{
                  color: isActive ? 'secondary.main' : 'white',
                  fontWeight: isActive ? 'bold' : 'normal',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05rem',
                  borderBottom: isActive ? '2px solid' : '2px solid transparent',
                  borderRadius: 0,
                  '&:hover': {
                    color: 'secondary.main',
                    borderBottom: '2px solid',
                    borderColor: 'secondary.main',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {page.label}
              </Button>
            );
          })}
        </Box>


        <Box sx={{ marginLeft: 'auto' }}>
          {user ? (
            <>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user.email}
                    src={userProfile && userProfile.profilePicture ? userProfile.profilePicture : ''}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting.label} onClick={() => handleSettingClick(setting)}>
                    <Typography textAlign="center">{setting.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Button component={Link} to="/logIn" color="inherit">
              Log In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
