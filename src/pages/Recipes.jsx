import React, { useEffect, useState } from 'react';
import { ref, get, child, remove, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [userRecipes, setUserRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const snapshot = await get(ref(db, 'recipes'));
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
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchUserRecipes = async () => {
            try {
                const snapshot = await get(ref(db, `users/${user.uid}/recipes`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const savedIds = Object.values(data).map(recipe => recipe.name?.toLowerCase());
                    setUserRecipes(savedIds);
                } else {
                    setUserRecipes([]);
                }
            } catch (error) {
                console.error('Error fetching user saved recipes:', error);
            }
        };

        fetchUserRecipes();
    }, [user]);

    const handleSave = async (recipeId) => {
        const confirmSave = window.confirm('Are you sure you want to save this recipe?');
        if (!confirmSave) return;

        try {
            const recipeSnap = await get(ref(db, `recipes/${recipeId}`));
            if (!recipeSnap.exists()) {
                alert('Recipe not found.');
                return;
            }

            const recipeData = recipeSnap.val();
            const userRecipesRef = ref(db, `users/${user.uid}/recipes`);
            const newRef = push(userRecipesRef);
            await set(newRef, recipeData);

            alert('Recipe saved to your list!');
            navigate('/userRecipes');
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Failed to save recipe.');
        }
    };

    if (loading) return <p>Loading recipes...</p>;

    return (
        <div>
            <h2>Recipes</h2>
            {recipes.length === 0 ? (
                <p>No recipes found.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {recipes.map(recipe => {
                        const alreadySaved = userRecipes.includes(recipe.name?.toLowerCase());

                        return (
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
                                <Link to={`/recipes/${recipe.id}`}>View Recipe</Link>{' '}
                                {' '}
                                {user && (
                                    <button
                                        onClick={() => handleSave(recipe.id)}
                                        disabled={alreadySaved}
                                        style={{
                                            color: alreadySaved ? 'gray' : 'green',
                                            cursor: alreadySaved ? 'not-allowed' : 'pointer',
                                            opacity: alreadySaved ? 0.5 : 1
                                        }}
                                    >
                                        {alreadySaved ? 'Saved' : 'Save'}
                                    </button>
                                )}

                            </div>
                        );
                    })}
                </div>
            )}
            <br />
            <Link to="/createRecipe">+ Add New Recipe</Link>
            <br />
            <Link to="/">Back</Link>
        </div>
    );
}
