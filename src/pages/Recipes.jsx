import React, { useEffect, useState } from 'react';
import { ref, get, child, remove } from 'firebase/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const dbRef = ref(db);
                const snapshot = await get(child(dbRef, 'recipes'));

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


    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this recipe?');
        if (!confirmDelete) return;

        try {
            await remove(ref(db, `recipes/${id}`));
            setRecipes(prev => prev.filter(recipe => recipe.id !== id));
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Failed to delete recipe.');
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
                    {recipes.map(recipe => (
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
                            <Link to={`/recipes/${recipe.id}`}>View Recipe</Link>
                            {' '}
                            <button onClick={() => handleDelete(recipe.id)} style={{ color: 'red' }}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <br />
            <Link to="/createRecipe">+ Add New Recipe</Link>
        </div>
    );
}
