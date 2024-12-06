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

// Render Main Content with Login/Register Forms
function renderMainContent() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <main>
      <section id="auth-section" style="display: none; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        <div id="login-form" style="display: none;">
          <h2>Login</h2>
          <form>
            <input type="text" id="login-username" placeholder="Username" required>
            <input type="password" id="login-password" placeholder="Password" required>
            <button type="submit">Login</button>
          </form>
        </div>
        <div id="register-form" style="display: none;">
          <h2>Register</h2>
          <form>
            <input type="text" id="register-username" placeholder="Username" required>
            <input type="password" id="register-password" placeholder="Password" required>
            <input type="email" id="register-email" placeholder="Email" required>
            <button type="submit">Register</button>
          </form>
        </div>
      </section>
    </main>
  `;
}

// Toggle Buttons Based on Login Status
function toggleButtons(isLoggedIn) {
  document.getElementById('login-btn').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('register-btn').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('logout-btn').style.display = isLoggedIn ? 'block' : 'none';
  document.getElementById('share-link').style.display = isLoggedIn ? 'inline-block' : 'none';
}

// Add Event Listeners for Login/Registration Display
function addEventListeners() {
  document.getElementById('login-btn').addEventListener('click', () => {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
  });

  document.getElementById('register-btn').addEventListener('click', () => {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  });
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
      document.getElementById('register-form').reset();
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
    .then((response) => response.json())
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
  if (isLoggedIn) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('user-display').textContent = username;
  } else {
    document.getElementById('auth-section').style.display = 'flex';
  }
}

// Initialize Application
function initializeApp() {
  renderHeader();
  renderFooter();
  renderMainContent();
  addEventListeners();

  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

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
