import React, { useEffect, useState } from 'react';
import { ref, get, child, remove } from 'firebase/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export default function Ingredients() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const auth = getAuth();

    const user = auth.currentUser;

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const dbRef = ref(db);
                const snapshot = await get(child(dbRef, 'ingredients'));

                if (snapshot.exists()) {
                    const data = snapshot.val();

                    const items = Object.entries(data).map(([id, value]) => ({
                        id,
                        ...value,
                    }));

                    setIngredients(items);
                } else {
                    setIngredients([]);
                }
            } catch (error) {
                console.error('Error fetching ingredients:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIngredients();
    }, []);


    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this ingredient?');
        if (!confirmDelete) return;

        try {
            await remove(ref(db, `ingredients/${id}`));
            setIngredients(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting ingredient:', error);
            alert('Failed to delete ingredient.');
        }
    };


    if (loading) return <p>Loading ingredients...</p>;

    const filteredIngredients = ingredients.filter(ingredient =>
        ingredient.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );


    return (
        <div>
            <h2>Ingredients List</h2>
            <div>
                <label htmlFor="search">Search Ingredients: </label>
                <input
                    id="search"
                    type="text"
                    placeholder="Enter name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {ingredients.length === 0 ? (
                <p>No ingredients found.</p>
            ) : (

                <ul>
                    {filteredIngredients.map(ingredient => (
                        <li key={ingredient.id}>
                            <strong>{ingredient.name}</strong> — {ingredient.quantity} {ingredient.unit}
                            <br />
                            <Link to={`/updateIngredient/${ingredient.id}`}>Edit</Link>
                            {' '}
                            <button onClick={() => handleDelete(ingredient.id)}>Delete</button>
                        </li>
                    ))}
                </ul>

            )}
            <Link to="/createIngredient">Add an Ingredient</Link>
        </div>
    );
}