// Fetch existing users from localStorage
const usersDB = JSON.parse(localStorage.getItem("usersDB")) || [];

// Regular login function
function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Add your regular login logic here
    // For demo purposes, we'll just redirect to the chat page
    if (username && password) {
        localStorage.setItem('user', JSON.stringify({ username: username }));
        window.location.href = 'chatb.html';
    } else {
        showError('Please fill in all fields');
    }
    return false;
}

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    const token = response.credential;
    
    // Decode the JWT token
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Store user info in localStorage
    const userInfo = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        isGoogleUser: true
    };
    
    localStorage.setItem('user', JSON.stringify(userInfo));
    
    // Redirect to the chat page
    window.location.href = 'chatb.html';
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide error after 3 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}
