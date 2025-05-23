import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../firebase';

import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Box,
} from '@mui/material';

import QuartermasterIcon from '../assets/Quartermaster.png';

export default function Home() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [recentRecipes, setRecentRecipes] = useState([]);


  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }

        const userRecipesRef = ref(db, `users/${firebaseUser.uid}/recipes`);
        const recipesUnsub = onValue(userRecipesRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const recipesArray = Object.entries(data).map(([id, recipe]) => ({ id, ...recipe }));

            const likeCountPromises = recipesArray.map(async (recipe) => {
              const sharedRef = ref(db, `recipes/${recipe.id}/likes`);
              try {
                const likeSnapshot = await get(sharedRef);
                const likes = likeSnapshot.exists() ? likeSnapshot.val() : 0;
                return { ...recipe, likes };
              } catch (error) {
                console.error(`Failed to fetch likes for ${recipe.id}:`, error);
                return { ...recipe, likes: 0 };
              }
            });

            const recipesWithLikes = await Promise.all(likeCountPromises);
            setRecentRecipes(recipesWithLikes.slice(-4).reverse());
          } else {
            setRecentRecipes([]);
          }
        });

        return () => recipesUnsub();
      } else {
        setUserProfile(null);
        setSavedRecipeIds([]);
        setLikedRecipeIds([]);
        setRecentRecipes([]);
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <img
        src={QuartermasterIcon}
        alt="Quartermaster Icon"
        style={{
          width: '200px',
          height: '200px',
          marginRight: '8px',
        }}
      />
      <Typography variant="h3" gutterBottom>
        Welcome to Quartermaster
      </Typography>

      <Typography variant="h6" gutterBottom>
        {user && userProfile
          ? `Hello, ${userProfile.username}! Here’s a snapshot of your kitchen.`
          : 'Manage your ingredients and recipes. Sign in to get started!'}
      </Typography>

      <Box sx={{ my: 4, display:'flex', justifyContent:'center',}}>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" component={Link} to="/recipes">
              Explore Shared Recipes
            </Button>
          </Grid>
          {user && (
            <>
              <Grid item>
                <Button variant="outlined" component={Link} to="/userRecipes">
                  Your Recipes
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" component={Link} to="/ingredients">
                  Your Ingredients
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" component={Link} to="/createRecipe">
                  Create New Recipe
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      {user && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Your Recent Recipes
          </Typography>

          {recentRecipes.length > 0 ? (
            <Grid container spacing={2}>
              {recentRecipes.map((recipe) => {
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={2}
                    xl={2}
                    key={recipe.id}
                  >
                    <Card
                      sx={{
                        width: {
                          xs: 320,
                          sm: 380,
                        },
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={recipe.imageUrl}
                        alt={recipe.name}
                        sx={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          height: {
                            xs: 100,
                            sm: 140,
                          },
                          width: '100%',
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {recipe.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {recipe.ingredients?.length || 0} ingredients
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ px: 2, justifyContent: 'space-between', display: 'flex' }}>
                        <Box>
                          <Button
                            sx={{ paddingY: 1 }}
                            component={Link}
                            to={`/userRecipes/${recipe.id}`}
                            variant="outlined"
                            size="small"
                          >
                            View
                          </Button>
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            color="skyblue"
                            border="1px solid skyblue"
                            borderRadius={2}
                            paddingX={1}
                            paddingY={1}
                          >
                            {recipe.likes || 0} Likes
                          </Typography>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ mt: 2 }}>
              You haven’t added any recipes yet.{' '}
              <Button component={Link} to="/createRecipe" size="small">
                Add one now
              </Button>
            </Typography>
          )}
        </>
      )}
    </Container>
  );
}
