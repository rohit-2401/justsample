import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    // your firebase configuration
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// User Registration
function registerUser() {
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User registered:", userCredential.user);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// Google Sign-In
function googleSignIn() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Google sign-in successful:", result.user);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// Display Tournaments
function displayTournaments(user) {
    const tournamentsRef = collection(firestore, 'tournaments');
    const q = query(tournamentsRef, where('participants', 'array-contains', user.uid));
    
    getDocs(q)
        .then((querySnapshot) => {
            const tournamentList = document.getElementById('tournamentList');
            tournamentList.innerHTML = ''; // Clear existing entries
            querySnapshot.forEach((doc) => {
                const tournamentData = doc.data();
                const tournamentDiv = document.createElement('div');
                tournamentDiv.innerHTML = `
                    <h2>${tournamentData.name}</h2>
                    <p>Participants: ${tournamentData.participants.join(', ')}</p>
                    <button onclick="createTournamentBracket('${tournamentData.participants.join(',')}')">Start Tournament</button>
                `;
                tournamentList.appendChild(tournamentDiv);
            });
        })
        .catch((error) => {
            console.error("Error getting tournaments:", error);
        });
}

// Function to create tournament brackets
function createTournamentBracket(participants) {
    let teams = participants.split(',');

    while (teams.length > 1) {
        const winners = [];
        for (let i = 0; i < teams.length; i += 2) {
            // Randomly pick a winner from each pair of teams
            const winner = Math.random() > 0.5 ? teams[i] : teams[i + 1];
            winners.push(winner);
        }

        teams = winners;
    }

    const winner = teams[0];
    alert(`Winner of the tournament: ${winner}`);
}

// Authentication State Changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, display tournaments
        displayTournaments(user);
    } else {
        // User is signed out
        console.log('User is signed out.');
    }
});