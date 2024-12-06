const baseUrl = "http://localhost:8080/M00922271";

// Render Header
function renderHeader() {
  const header = document.createElement('header');
  header.innerHTML = `
    <div class="logo">Recipe Hub</div>
    <nav>
      <a href="#" id="home-link">Home</a>
      <a href="#about" id="about-link">About</a>
      <a href="#contact" id="contact-link">Contact</a>
      <a href="#share" id="share-link" style="display: none;">Share Recipe</a>
    </nav>
    <div id="auth-buttons">
      <button id="login-btn">Login</button>
      <button id="register-btn">Register</button>
      <button id="logout-btn" style="display: none;">Logout</button>
    </div>
  `;
  document.body.prepend(header);
}

// Render Footer
function renderFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <p>&copy; 2024 Recipe Hub. Sharing recipes made simple. | <a href="#privacy">Privacy Policy</a></p>
  `;
  document.body.appendChild(footer);
}

// Render Main Content
function renderMainContent() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <main>
      <section id="auth-section">
        <div id="login-form" style="display: none;">
          <h2>Login</h2>
          <form id="login-form-el">
            <input type="text" id="login-username" placeholder="Username" required>
            <input type="password" id="login-password" placeholder="Password" required>
            <button type="submit">Login</button>
          </form>
        </div>
        <div id="register-form" style="display: none;">
          <h2>Register</h2>
          <form id="register-form-el">
            <input type="text" id="register-username" placeholder="Username" required>
            <input type="password" id="register-password" placeholder="Password" required>
            <input type="email" id="register-email" placeholder="Email" required>
            <button type="submit">Register</button>
          </form>
        </div>
      </section>
      <section id="content-section" style="display: none;">
        <h2>Welcome, <span id="user-display"></span>!</h2>
      </section>
    </main>
  `;
}

// Toggle Buttons Based on Login Status
function toggleButtons(isLoggedIn) {
  const loginButton = document.getElementById('login-btn');
  const registerButton = document.getElementById('register-btn');
  const logoutButton = document.getElementById('logout-btn');
  const shareLink = document.getElementById('share-link');

  if (loginButton && registerButton && logoutButton && shareLink) {
    loginButton.style.display = isLoggedIn ? 'none' : 'block';
    registerButton.style.display = isLoggedIn ? 'none' : 'block';
    logoutButton.style.display = isLoggedIn ? 'block' : 'none';
    shareLink.style.display = isLoggedIn ? 'inline-block' : 'none';
  } else {
    console.error('One or more buttons are missing from the DOM.');
  }
}

// Add Event Listeners for Login/Registration Display
function addEventListeners() {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authSection = document.getElementById('auth-section');

  if (loginBtn && registerBtn && loginForm && registerForm && authSection) {
    loginBtn.addEventListener('click', () => {
      authSection.style.display = 'flex';
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    });

    registerBtn.addEventListener('click', () => {
      authSection.style.display = 'flex';
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    });
  } else {
    console.error('One or more login/register elements are missing from the DOM.');
  }
}

// Handle Registration
function handleRegister(event) {
  event.preventDefault();
  const data = {
    username: document.getElementById('register-username').value,
    password: document.getElementById('register-password').value,
    email: document.getElementById('register-email').value,
  };

  fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => Promise.reject(data));
      }
      alert('Registration successful! Proceed to login.');
      document.getElementById('register-form-el').reset();
      document.getElementById('login-btn').click();
    })
    .catch((err) => {
      alert('Registration failed: ' + err.message);
    });
}

// Handle Login
function handleLogin(event) {
  event.preventDefault();
  const data = {
    username: document.getElementById('login-username').value,
    password: document.getElementById('login-password').value,
  };

  fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => Promise.reject(data));
      }
      return response.json();
    })
    .then((data) => {
      alert('Login successful!');
      localStorage.setItem('token', data.token);
      toggleSections(true, data.username);
      toggleButtons(true);
    })
    .catch((err) => {
      alert('Login failed: ' + err.message);
    });
}

// Handle Logout
function handleLogout() {
  fetch(`${baseUrl}/login`, {
    method: 'DELETE',
  })
    .then(() => {
      alert('Logged out successfully!');
      localStorage.removeItem('token');
      toggleSections(false);
      toggleButtons(false);
    })
    .catch((err) => {
      alert('Error logging out: ' + err.message);
    });
}

// Toggle Sections Based on Login Status
function toggleSections(isLoggedIn, username = '') {
  const userDisplay = document.getElementById('user-display');
  const authSection = document.getElementById('auth-section');
  const contentSection = document.getElementById('content-section');

  if (authSection && contentSection) {
    authSection.style.display = isLoggedIn ? 'none' : 'flex';
    contentSection.style.display = isLoggedIn ? 'block' : 'none';
    if (isLoggedIn && userDisplay) {
      userDisplay.textContent = username;
    }
  } else {
    console.error('One or more sections are missing from the DOM.');
  }
}

// Initialize Application
function initializeApp() {
  renderHeader();
  renderFooter();
  renderMainContent();
  addEventListeners();

  const registerForm = document.getElementById('register-form-el');
  const loginForm = document.getElementById('login-form-el');
  const logoutBtn = document.getElementById('logout-btn');

  if (registerForm && loginForm && logoutBtn) {
    registerForm.addEventListener('submit', handleRegister);
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
  } else {
    console.error('One or more forms/buttons are missing from the DOM.');
  }

  const token = localStorage.getItem('token');
  if (token) {
    fetch(`${baseUrl}/login`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            toggleSections(true, data.username);
            toggleButtons(true);
          });
        } else {
          toggleSections(false);
          toggleButtons(false);
        }
      });
  } else {
    toggleSections(false);
    toggleButtons(false);
  }
}

initializeApp();
