import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

export default function TestSecurity() {

    const testAccessOtherUser = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
      
        if (!currentUser) {
          alert('No user is logged in.');
          return;
        }
      
        const otherUid = 'OzcwBTeTwZgg28I3crHbAjyAEhk1'; 
      
        try {
          const snapshot = await get(ref(db, `users/${otherUid}/recipes`));
          if (snapshot.exists()) {
            console.log('Accessed other user’s data:', snapshot.val());
            alert('Access granted');
          } else {
            console.log('No data found or access denied.');
            alert('Access denied or no data (expected).');
          }
        } catch (error) {
          console.error('ACCESS BLOCKED (as expected):', error.message);
          alert('ACCESS BLOCKED: ' + error.message);
        }
      };
      

    return (
        <>
            <button onClick={testAccessOtherUser}>
                Test Access to Another User's Recipes
            </button>
        </>
    )
}