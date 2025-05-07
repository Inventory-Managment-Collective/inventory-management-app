import React, { useEffect, useState } from 'react';
import { ref, get, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
//Imports for all the stuff we need for the page, useEffect and useState hooks,
//ref, get, push and set firebase databse for communicating with teh RTDB
//Link for navigation aswell as useNavigate and get Auth and AuthStateChange methods to
//keep track of the currently logged in user.

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [userRecipes, setUserRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    const auth = getAuth();
//Initialisation of state and auth set up, recipes fro the global recipes,
//userRecipes for the recipes the user already has in their account, loading
//to indicate if the data is still being fethced and user for the current user


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });

        return () => unsubscribe();
    }, []);
//onAuthStateChange keep track of changes in authentication. When a user logs in,
//firebaseUser will be populated and user will be set to it. WHen the user logs out, 
//user becomes null

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const snapshot = await get(ref(db, 'recipes'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const items = Object.entries(data).map(([id, value]) => ({
                        id,
                        likes: value.likes || 0,
                        likedBy: value.likedBy || {},
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
//retrieves all the global recipes, located in the /recipes node, using firebase get method. 
//Uses Object.entries() to convert the data from an object to an array and sets the defaults 
//for likes and likedBy to 0 and an empty object. Likes will keep track of how many times  
//a recipes has been liked and likedBy will be used to prevent users from liking things multiple times.
    
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
//fetches recipes similar to the above but this time for user specific recipes. Only takes in
//the names of the saved recipes, stored in userRecipes, so that we can keep track of which recipes
//the user has already saved. 

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
//Functionality that allows the user to save a global recipe to their own personal recipe list.
//fetches the particular recipes data from the recipes node with get. stores the info for that recipe
//in recipe data. contructs the path to the users recipe node in userRecipesRef. newRef generates a fresh id 
//so the saved recipe won't overwrite anything and then uses set to write recipeData to the specified newRef path

    const handleLike = async (recipeId) => {
        if (!user) {
            alert('You must be logged in to like a recipe.');
            return;
        }

        try {
            const recipeRef = ref(db, `recipes/${recipeId}`);
            const snapshot = await get(recipeRef);

            if (!snapshot.exists()) {
                alert('Recipe not found.');
                return;
            }

            const recipeData = snapshot.val();
            const likedBy = recipeData.likedBy || {};

            if (likedBy[user.uid]) {
                alert('You have already liked this recipe.');
                return;
            }

            const updatedLikes = (recipeData.likes || 0) + 1;

            await set(recipeRef, {
                ...recipeData,
                likes: updatedLikes,
                likedBy: {
                    ...likedBy,
                    [user.uid]: true
                }
            });

            setRecipes(prev =>
                prev.map(recipe =>
                    recipe.id === recipeId
                        ? { ...recipe, likes: updatedLikes, likedBy: { ...likedBy, [user.uid]: true } }
                        : recipe
                )
            );

            alert('Recipe liked!');
        } catch (error) {
            console.error('Error liking recipe:', error);
            alert('Failed to like recipe.');
        }
    };
//Functionality for the like button. Generates a reference to the specific recipe stored in recipeRef.
//Fetches that recipes data with get, stores it in snapshot. extracts the recipe data with .val(). in particular, 
//stores the liked by object to retrieve who has already liked the recipe, empty if likedBy doesn't exist. checks if the user's
//id features in liked by, wont' progress if so. calulates the new likes value and stores it in updatedLikes. updates the recipe
//with the new likes and likeBy values with set(). updates the recipes state to reflect the changes, iterates over the array with .map().
//If the id matches the liked recipe, we update its likes and likedBy.




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
                                <p>Likes: {recipe.likes || 0}</p>
                                <Link to={`/recipes/${recipe.id}`}>View Recipe</Link>{' '}
                                {user && (
                                    <>
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
                                        {' '}
                                        <button
                                            onClick={() => handleLike(recipe.id)}
                                            disabled={recipe.likedBy?.[user.uid]}
                                            style={{
                                                color: recipe.likedBy?.[user.uid] ? 'gray' : 'blue',
                                                cursor: recipe.likedBy?.[user.uid] ? 'not-allowed' : 'pointer',
                                                opacity: recipe.likedBy?.[user.uid] ? 0.5 : 1,
                                                marginLeft: '8px'
                                            }}
                                        >
                                            👍 {recipe.likedBy?.[user.uid] ? 'Liked' : 'Like'}
                                        </button>
                                    </>
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
