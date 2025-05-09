# Quartermaster - Inventory Management App 🍲

![Quartermaster](src/assets/Quartermaster.png')

## Introduction and Overview 🧑‍🍳
Quartermaster is an inventory management application that helps users keep track their kitchen inventory, manage recipes, and share culinary creations with other users. The app provides functionalities such as ingredient tracking, recipe creation, and user profile management, aiming to streamline the cooking experience by keeping everything in one place and introduce a small social element to it.

## Features 🍪
- **Recipe Management:** Create, edit, and delete recipes, each containing a name, image, instructions, and ingredients.
- **Ingredient Tracking:** Maintain a list of ingredients with names, quantities, and units.
- **Recipe Sharing:** Share your recipes publicly for other users to view, like and save for themselves.
- **Likes:** Users can leave likes on shared recipes.
- **Profile Management:** Update profile picture, username, and about section.
- **Cloudinary Integration:** Image uploads are handled via Cloudinary.
- **Firebase Integration:** Data is stored and managed using Firebase Realtime Database.

## Technologies Used 🤓
- React.js
- Firebase Authentication and Realtime Database
- Material UI for UI components
- Cloudinary for image hosting
- React Toastify for notifications

## Usage 📖
- Navigate to the home page to view recent activity and explore shared recipes.
- Create a new recipe by clicking the "Create New Recipe" button.
- Update or delete your existing recipes from the "Your Recipes" page.
- Update your profile picture, username, and about section in the profile settings.

## API Structure 🌐
- **Recipes:** All shared recipes are stored under the `recipes` node in Firebase.
- **Users:** User-specific data (recipes, ingredients, profile info) is stored under the `users/{uid}` node.
- **Likes:** Likes are tracked under each recipe using the `likedBy` object.

## Future Enhancements 😎
- Implement notifications for recipe interactions (likes).
- Improve user dashboard with recent activity and recipe suggestions.
- Integrate AI into the program to enhance functionality. For instance, uplaoding ingredints to your list by just taking a photo of your shopping.
- Implement comments for shared recipes to improve the social experience.
