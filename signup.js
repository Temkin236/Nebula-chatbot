// Initialize users database
let usersDB = JSON.parse(localStorage.getItem("usersDB")) || [];

function handleSignup(event) {
    event.preventDefault();
    
    // Get form elements
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const usernameError = document.getElementById("username-error");
    const confirmError = document.getElementById("confirm-error");

    // Clear previous errors
    usernameError.textContent = "";
    confirmError.textContent = "";

    // Validate username
    if (username.length < 3) {
        usernameError.textContent = "Username must be at least 3 characters";
        return false;
    }

    // Check if username exists
    if (usersDB.some(user => user.username === username)) {
        usernameError.textContent = "Username already taken";
        return false;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
        confirmError.textContent = "Passwords do not match";
        return false;
    }

    // Create new user
    const newUser = {
        username: username,
        password: password,
        chatHistory: []
    };

    // Add to database
    usersDB.push(newUser);
    localStorage.setItem("usersDB", JSON.stringify(usersDB));

    // Store current user
    localStorage.setItem("currentUser", JSON.stringify({
        username: username,
        isLoggedIn: true
    }));

    // Show success message and redirect
    alert("Successfully signed up! Welcome to Nebula AI Chat.");
    window.location.href = "chatb.html";
    return false;
}

// Get form elements
const signupForm = document.getElementById("signup-form");

// Add form submit event listener
signupForm.addEventListener("submit", handleSignup);