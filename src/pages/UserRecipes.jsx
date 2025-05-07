import React, { useEffect, useState } from 'react';
import { ref, get, child, push, remove, set } from 'firebase/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Button, TextField, Box } from '@mui/material';
//This functions very similarly to Recipes except no like button, save is replaced with share
//and the user can delete a recipe or view recipe if they choose so.


export default function UserRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchRecipes = async () => {
            try {
                const dbRef = ref(db);
                const snapshot = await get(child(dbRef, `users/${user.uid}/recipes`));

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const items = Object.entries(data).map(([id, value]) => ({
                        id,
                        ...value,
                    }));
                    setRecipes(items);
                } else {
                    setRecipes([]);
                }
            } catch (error) {
                console.error('Error fetching recipes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [user]);
    //fetches the list of recieps, similar to Recipes, but this time it pointed to the list of recipes associated 
    //with the current user, goes to `users/${user.uid}/recipes` instead of just 'recipes' and child is used to construct a
    //relative path from dbRef, the path to the root of the database.


    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this recipe?');
        if (!confirmDelete) return;

        try {
            await remove(ref(db, `users/${user.uid}/recipes/${id}`));
            setRecipes(prev => prev.filter(recipe => recipe.id !== id));
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Failed to delete recipe.');
        }
    };
    //fucntionality so that the user can delete a recipe from their list, functions the same as delete in ingredeints 
    //but uses the path to a particular recipe instead of an ingredient

    const handleShare = async (recipeId) => {
        const confirmShare = window.confirm('Do you want to share this recipe globally?');
        if (!confirmShare) return;

        try {
            const userRecipeSnap = await get(ref(db, `users/${user.uid}/recipes/${recipeId}`));
            if (!userRecipeSnap.exists()) {
                alert('Recipe not found.');
                return;
            }

            const recipeData = userRecipeSnap.val();
            const globalRecipesRef = ref(db, 'recipes');
            const newRef = push(globalRecipesRef);
            await set(newRef, recipeData);

            alert('Recipe shared successfully!');
        } catch (error) {
            console.error('Error sharing recipe:', error);
            alert('Failed to share recipe.');
        }
    };
    //functionality for the user to share a recipe. functions very similarly to handleSave but the paths for get and 
    //push are swapped around.

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name?.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    //functionality to filter the results displayed on the page based on user input, similar to ingredeints and recipes

    if (loading) return <p>Loading recipes...</p>;

    return (
        <div>
            <h2>Recipes</h2>
            {user ? (
                <>
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                        <TextField
                            label="Search Recipes"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: '300px' }}
                        />
                    </Box>

                    <Link to="/createRecipe">+ Add New Recipe</Link>

                    {filteredRecipes.length === 0 ? (
                        <p>No recipes found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {filteredRecipes.map(recipe => (
                                <div
                                    key={recipe.id}
                                    style={{
                                        border: '1px solid #ccc',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        width: '250px',
                                    }}
                                >
                                    <img
                                        src={recipe.imageUrl}
                                        alt={recipe.name}
                                        style={{ width: '100%', borderRadius: '4px' }}
                                    />
                                    <h3>{recipe.name}</h3>
                                    <p>{recipe.ingredients?.length || 0} ingredients</p>
                                    <Link to={`/userRecipes/${recipe.id}`}>View Recipe</Link>
                                    {' '}
                                    <Button onClick={() => handleDelete(recipe.id)} sx={{ color: 'red' }}>
                                        Delete
                                    </Button>
                                    {' '}
                                    <Button
                                        variant="contained"
                                        onClick={() => handleShare(recipe.id)}
                                        sx={{ color: 'blue' }}
                                    >
                                        Share
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div>
                    <p>You must be logged in to view your recipes.</p>
                    <Link to="/logIn">Log In</Link>
                    <br />
                    <Link to="/signUp">Sign Up</Link>
                </div>
            )}
        </div>
    );
}
