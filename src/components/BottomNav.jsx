import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Paper from '@mui/material/Paper';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavi() {
    const location = useLocation();
    const [value, setValue] = React.useState(0);
  
    React.useEffect(() => {
      if (location.pathname.startsWith('/') && !location.pathname.startsWith('/userRecipes')) {
        setValue(0);
      } else if (location.pathname.startsWith('/userRecipes')) {
        setValue(1);
      } else if (location.pathname === '/ingredients') {
        setValue(2);
      }
    }, [location]);
  
    return (
      <Box sx={{ pb: 7 }}>
        <CssBaseline />
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
          >
            <BottomNavigationAction
              label="Recipes"
              icon={<MenuBookIcon />}
              component={Link}
              to="/recipes"
            />
            <BottomNavigationAction
              label="Your Recipes"
              icon={<BookmarkIcon />}
              component={Link}
              to="/userRecipes"
            />
            <BottomNavigationAction
              label="Ingredients"
              icon={<RestaurantMenuIcon />}
              component={Link}
              to="/ingredients"
            />
          </BottomNavigation>
        </Paper>
      </Box>
    );
  }