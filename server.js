/*import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';


const app = express();
const PORT = 8080;
const MONGO_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'social_network';
const SECRET_KEY = 'your_secret_key';
const STUDENT_ID = 'M00922271';

app.use(bodyParser.json());


// Set the relative path
const publicPath = './public'; // Relative path
console.log('Serving static files from:', publicPath);

// Serve static files
app.use(express.static(publicPath));

// Default Route
app.get(`/${STUDENT_ID}`, (req, res) => {
  res.sendFile('index.html', { root: publicPath });
});




// MongoDB Setup
let db;
MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DATABASE_NAME);
    console.log(`Connected to database: ${DATABASE_NAME}`);
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Helper Function: Verify Token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Routes


// 1. Register User
app.post(`/${STUDENT_ID}/users`, async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) return res.status(400).json({ message: 'All fields are required' });

  try {
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({ username, password: hashedPassword, email });

    res.status(201).json({ message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err });
  }
});

// 2. Login User
app.post(`/${STUDENT_ID}/login`, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

  try {
    const user = await db.collection('users').findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid username or password' });

    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful!', token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err });
  }
});

// 3. Check Login Status
app.get(`/${STUDENT_ID}/login`, verifyToken, (req, res) => {
  res.status(200).json({ loggedIn: true, username: req.user.username });
});

// 4. Logout User
app.delete(`/${STUDENT_ID}/login`, (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

// 5. Post Content
app.post(`/${STUDENT_ID}/contents`, verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Content is required' });

  try {
    await db.collection('contents').insertOne({ content, userId: req.user.id, createdAt: new Date() });
    res.status(201).json({ message: 'Content posted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error posting content', error: err });
  }
});

// 6. Get User-Specific Content
app.get(`/${STUDENT_ID}/contents`, verifyToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    const contents = await db.collection('contents').find({ userId: { $in: user.following || [] } }).toArray();
    res.status(200).json(contents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching content', error: err });
  }
});
// Fetch User-Specific Posts
app.get(`/${STUDENT_ID}/contents/user`, verifyToken, async (req, res) => {
  try {
    const posts = await db.collection('contents')
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Sort posts by newest first
      .toArray();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user posts', error: err });
  }
});


// 7. Follow User
app.post(`/${STUDENT_ID}/follow`, verifyToken, async (req, res) => {
  const { followId } = req.body;
  try {
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $addToSet: { following: new ObjectId(followId) } }
    );
    res.status(200).json({ message: 'User followed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error following user', error: err });
  }
});

// 8. Unfollow User
app.delete(`/${STUDENT_ID}/follow`, verifyToken, async (req, res) => {
  const { unfollowId } = req.body;
  try {
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $pull: { following: new ObjectId(unfollowId) } }
    );
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error unfollowing user', error: err });
  }
});
app.get(`/${STUDENT_ID}/users/search`, verifyToken, async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ message: 'Search query is required' });

  try {
    const users = await db.collection('users')
      .find({ username: { $regex: query, $options: 'i' } }) // Case-insensitive search
      .project({ username: 1 }) // Only return username
      .toArray();

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error searching users', error: err });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/${STUDENT_ID}`);
});
*/
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 8080;
const MONGO_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'social_network';
const SECRET_KEY = 'your_secret_key';
const STUDENT_ID = 'M00922271';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// MongoDB Setup
let db;
MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DATABASE_NAME);
    console.log(`Connected to database: ${DATABASE_NAME}`);
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Helper Function: Verify Token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Default Route
app.get(`/${STUDENT_ID}`, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register User
app.post(`/${STUDENT_ID}/users`, async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) return res.status(400).json({ message: 'All fields are required' });

  try {
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({ username, password: hashedPassword, email });

    res.status(201).json({ message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err });
  }
});

// Login User
app.post(`/${STUDENT_ID}/login`, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

  try {
    const user = await db.collection('users').findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid username or password' });

    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful!', token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err });
  }
});

// Get User Feed
app.get(`/${STUDENT_ID}/contents`, verifyToken, async (req, res) => {
  try {
    const contents = await db.collection('contents')
      .find({ userId: { $in: [req.user.id] } }) // User's posts
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(contents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching content', error: err });
  }
});

// Post Content
// app.post(`/${STUDENT_ID}/contents`, verifyToken, async (req, res) => {
//   const { content } = req.body;
//   if (!content) return res.status(400).json({ message: 'Content is required' });

//   try {
//     const post = {
//       content,
//       userId: req.user.id,
//       createdAt: new Date(),
//     };
//     await db.collection('contents').insertOne(post);
//     res.status(201).json({ message: 'Content posted successfully!' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error posting content', error: err });
//   }
// });

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
    await db.collection('contents').insertOne(recipe);
    res.status(201).json({ message: 'Recipe shared successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error sharing recipe.', error: err });
  }
});


// Get User Profile
app.get(`/${STUDENT_ID}/contents/user`, verifyToken, async (req, res) => {
  try {
    const posts = await db.collection('contents')
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user posts', error: err });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/${STUDENT_ID}`);
});
