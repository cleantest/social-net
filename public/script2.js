const baseUrl = "http://localhost:8080/M00922271";

// Render Header
function renderHeader() {
  const header = document.createElement('header');
  header.innerHTML = `
    <h1>Recipe Service</h1>
    <nav>
      <a href="#" id="home-link">Home</a>
      <a href="#about" id="about-link">About</a>
      <a href="#contact" id="contact-link">Contact</a>
    </nav>
  `;
  document.body.prepend(header);
}

// Render Footer
function renderFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = `<p>&copy; 2024 Recipe Service. All rights reserved.</p>`;
  document.body.appendChild(footer);
}

// Render Main Content
function renderMainContent() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <main>
      <section id="auth-section">
        <h2>Register</h2>
        <form id="register-form">
          <input type="text" id="register-username" placeholder="Username" required>
          <input type="password" id="register-password" placeholder="Password" required>
          <input type="email" id="register-email" placeholder="Email" required>
          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <button id="show-login-btn">Proceed to Login</button></p>
      </section>

      <section id="login-section" style="display: none;">
        <h2>Login</h2>
        <form id="login-form">
          <input type="text" id="login-username" placeholder="Username" required>
          <input type="password" id="login-password" placeholder="Password" required>
          <button type="submit">Login</button>
        </form>
      </section>

      <section id="content-section" style="display: none;">
        <h2>Welcome, <span id="user-display"></span>!</h2>
        <form id="post-recipe-form">
          <input type="text" id="post-title" placeholder="Recipe Title (e.g., Chocolate Cake)" required>
          <textarea id="post-description" placeholder="Recipe Description" required></textarea>
          <button type="submit">Post Recipe</button>
        </form>
        <div id="recipes">
          <h3>Your Recipes</h3>
          <ul id="recipe-list"></ul>
        </div>
        <button id="logout-btn">Logout</button>
      </section>
    </main>
  `;
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
      if (response.ok) {
        alert('Registration successful! Proceed to login.');
        showLoginForm();
      } else {
        return response.json().then((data) => Promise.reject(data));
      }
    })
    .catch((err) => alert('Registration failed: ' + err.message));
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
    })
    .catch((err) => alert('Login failed: ' + err.message));
}

// Handle Recipe Posting
function handlePostRecipe(event) {
  event.preventDefault();
  const title = document.getElementById('post-title').value;
  const description = document.getElementById('post-description').value;
  const token = localStorage.getItem('token');

  if (!token) {
    alert('You must log in before posting a recipe.');
    return;
  }

  fetch(`${baseUrl}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),
  })
    .then((response) => {
      if (response.ok) {
        alert('Recipe posted successfully!');
        document.getElementById('post-title').value = '';
        document.getElementById('post-description').value = '';
        fetchRecipes();
      } else {
        return response.json().then((data) => Promise.reject(data));
      }
    })
    .catch((err) => alert('Error posting recipe: ' + err.message));
}

// Fetch Recipes
function fetchRecipes() {
  const token = localStorage.getItem('token');

  fetch(`${baseUrl}/recipes`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => response.json())
    .then((recipes) => {
      const recipeList = document.getElementById('recipe-list');
      recipeList.innerHTML = '';
      recipes.forEach((recipe) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <img src="${recipe.imageUrl}" alt="${recipe.title}" style="width:100px;height:100px;">
          <strong>${recipe.title}</strong>: ${recipe.description}
        `;
        recipeList.appendChild(li);
      });
    })
    .catch((err) => alert('Error fetching recipes: ' + err.message));
}

// Toggle Sections
function toggleSections(isLoggedIn, username = '') {
  if (isLoggedIn) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('content-section').style.display = 'block';
    document.getElementById('user-display').textContent = username;
    fetchRecipes();
  } else {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('content-section').style.display = 'none';
  }
}

// Show Login Form
function showLoginForm() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
}

// Initialize Application
function initializeApp() {
  renderHeader();
  renderFooter();
  renderMainContent();

  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('post-recipe-form').addEventListener('submit', handlePostRecipe);

  const token = localStorage.getItem('token');
  if (token) {
    fetch(`${baseUrl}/login`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => toggleSections(true, data.username));
        } else {
          toggleSections(false);
        }
      });
  } else {
    toggleSections(false);
  }
}

initializeApp();
