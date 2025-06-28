// User management system
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = null;

// DOM elements
const loginModal = document.getElementById('login-modal');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');
const userGreeting = document.getElementById('user-greeting');
const rememberMeCheckbox = document.getElementById('remember-me');

// Case-insensitive login system
loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();
  const rememberMe = rememberMeCheckbox.checked;
  
  if (!username || !password) {
    showError("Please enter both username and password");
    return;
  }
  
  // Case-insensitive check
  const userKey = Object.keys(users).find(
    key => key.toLowerCase() === username
  );
  
  if (userKey && users[userKey] === password) {
    currentUser = userKey;
    if (rememberMe) {
      localStorage.setItem('currentUser', userKey);
    } else {
      sessionStorage.setItem('currentUser', userKey);
    }
    userGreeting.textContent = `Welcome, ${userKey}!`;
    loginModal.style.display = 'none';
    renderChannels();
  } else {
    showError("Invalid username or password");
  }
});

// Signup functionality
signupBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const rememberMe = rememberMeCheckbox.checked;
  
  if (!username || !password) {
    showError("Please enter both username and password");
    return;
  }
  
  // Case-insensitive check for existing user
  const existingUser = Object.keys(users).some(
    key => key.toLowerCase() === username.toLowerCase()
  );
  
  if (existingUser) {
    showError("Username already exists");
  } else {
    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = username;
    if (rememberMe) {
      localStorage.setItem('currentUser', username);
    } else {
      sessionStorage.setItem('currentUser', username);
    }
    userGreeting.textContent = `Welcome, ${username}!`;
    loginModal.style.display = 'none';
    renderChannels();
  }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('currentUser');
  localStorage.removeItem('currentUser');
  currentUser = null;
  loginModal.style.display = 'flex';
  userGreeting.textContent = "Welcome! Please log in";
  document.getElementById('playerTitle').innerHTML = '<i class="fas fa-play-circle"></i> Select a channel to start streaming';
  document.getElementById('player-frame').src = "";
  document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
});

// Check if user is already logged in
function checkLogin() {
  const savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
  if (savedUser && users[savedUser]) {
    currentUser = savedUser;
    loginModal.style.display = 'none';
    userGreeting.textContent = `Welcome, ${savedUser}!`;
    return true;
  }
  return false;
}

// Show error message
function showError(message) {
  loginError.textContent = message;
  loginError.style.display = 'block';
  setTimeout(() => {
    loginError.style.display = 'none';
  }, 3000);
}

// Initialize login check
if (checkLogin()) {
  // User is logged in, render channels after slight delay
  setTimeout(renderChannels, 100);
}

// Auto login for demo (remove in production)
setTimeout(() => {
  if (!currentUser) {
    usernameInput.value = "user";
    passwordInput.value = "pass123";
    rememberMeCheckbox.checked = true;
    loginBtn.click();
  }
}, 500);