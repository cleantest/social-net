import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const secretKey = process.env.SECRET_KEY || 'your-secret-key';
const STUDENT_ID = 'M00922271'; // Replace with your ID if needed

// MongoDB Configuration
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'recipe_hub';
let db;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Generate Token
function generateToken(user) {
  return jwt.sign({ id: user._id, username: user.username }, secretKey, {
    expiresIn: '1h',
  });
}

// Verify Token Middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }
    req.user = decoded;
    next();
  });
}

// Routes

// Register User
app.post(`/${STUDENT_ID}/users`, async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const newUser = { username, password, email };
    const result = await db.collection('users').insertOne(newUser);

    res.status(201).json({ message: 'User registered successfully!', userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user.', error: err });
  }
});

// Login User
app.post(`/${STUDENT_ID}/login`, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await db.collection('users').findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful!', token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in.', error: err });
  }
});

// Logout User
app.delete(`/${STUDENT_ID}/login`, (req, res) => {
  // Since token is stored on the client side, there's no need to manage it server-side
  res.status(200).json({ message: 'Logout successful!' });
});

// Post Recipe
app.post(`/${STUDENT_ID}/contents`, verifyToken, async (req, res) => {
  const { name, description, ingredients } = req.body;

  if (!name || !description || !ingredients) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const recipe = {
      name,
      description,
      ingredients,
      userId: req.user.id,
      createdAt: new Date(),
    };
    await db.collection('recipes').insertOne(recipe);
    res.status(201).json({ message: 'Recipe posted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error posting recipe.', error: err });
  }
});

// Fetch User's Recipes
app.get(`/${STUDENT_ID}/contents`, verifyToken, async (req, res) => {
  try {
    const recipes = await db.collection('recipes').find({ userId: req.user.id }).toArray();
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recipes.', error: err });
  }
});

// Fetch Single Recipe by ID
app.get(`/${STUDENT_ID}/contents/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id), userId: req.user.id });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recipe.', error: err });
  }
});

// Delete Recipe
app.delete(`/${STUDENT_ID}/contents/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.collection('recipes').deleteOne({ _id: new ObjectId(id), userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Recipe not found or not authorized.' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting recipe.', error: err });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/${STUDENT_ID}`);
});
