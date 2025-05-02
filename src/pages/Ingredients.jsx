import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Ingredients() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'ingredients'));
                const items = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setIngredients(items);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching ingredients:', error);
                setLoading(false);
            }
        };

        fetchIngredients();
    }, []);

    if (loading) return <p>Loading ingredients...</p>;

    return (
        <div>
            <h2>Ingredients List</h2>
            {ingredients.length === 0 ? (
                <p>No ingredients found.</p>
            ) : (
                <ul>
                    {ingredients.map(ingredient => (
                        <li key={ingredient.id}>
                            <strong>{ingredient.name}</strong> — {ingredient.quantity} ({ingredient.category})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}