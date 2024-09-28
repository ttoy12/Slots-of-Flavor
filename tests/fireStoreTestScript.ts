import { addUser, addLikedPlace, addDislikedPlace, removedLikedPlace, removedDislikedPlace } from '../app/firebase/firestore';
// import { db } from '../app/firebase/firebaseConfig';
// import { DocumentData } from 'firebase/firestore'; // Import the type for Firestore documents

// Define the shape of your business object
interface Business {
    id: string;
    name: string;
    price: string;
}

// Sample user and business data
const testUserID: string = 'testUser123';
const testEmail: string = 'testuser@example.com';
const testBusiness: Business = {
    id: 'business1',
    name: 'Test Business',
    price: '$10',
};

// Function to run tests
const runTests = async (): Promise<void> => {
    console.log("Starting tests...");

    try {
        // Test addUser
        await addUser(testUserID, testEmail);

        // Test addLikedPlace
        await addLikedPlace(testUserID, testBusiness);
        console.log("Added liked place:", testBusiness);

        // Test addDislikedPlace
        await addDislikedPlace(testUserID, testBusiness);
        console.log("Added disliked place:", testBusiness);

        // Test removedLikedPlace
        await removedLikedPlace(testUserID, testBusiness);
        console.log("Removed liked place:", testBusiness);

        // Test removedDislikedPlace
        await removedDislikedPlace(testUserID, testBusiness);
        console.log("Removed disliked place:", testBusiness);

        // Optionally, retrieve the user document to verify the changes
        // const userDoc = await getDoc(doc(db, 'users', testUserID));
        // if (userDoc.exists()) {
        //     console.log("Final user document:", userDoc.data() as DocumentData); // Cast to DocumentData
        // } else {
        //     console.log("User document does not exist.");
        // }

        console.log("Tests completed.");
    } catch (error) {
        console.error("Error during tests:", error);
    }
};

// Run the tests
runTests();
