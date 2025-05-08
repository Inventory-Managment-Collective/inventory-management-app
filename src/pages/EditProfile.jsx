import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentPicture, setCurrentPicture] = useState('');
  const navigate = useNavigate();

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
          if (snapshot.exists()) {
            const profileData = snapshot.val();
            setCurrentPicture(profileData.profilePicture || '');
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_UNSIGNED_UPLOAD_PRESET);
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_NAME);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      let imageUrl = currentPicture;

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      await update(ref(db, `users/${user.uid}`), {
        profilePicture: imageUrl,
      });

      toast.success("Profile picture updated!");
      navigate('/profile');
    } catch (err) {
      toast.error('Failed to update profile picture: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Edit Profile Picture</h2>

      {currentPicture && (
        <img
          src={currentPicture}
          alt="Current Profile"
          style={{ width: '150px', height: '150px', borderRadius: '50%' }}
        />
      )}

      <form>
        <div>
          <label>New profile picture: </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <button type="button" onClick={handleSubmit}>Update</button>
      </form>

      <br />
      <Link to="/profile">Back</Link>
    </div>
  );
}
