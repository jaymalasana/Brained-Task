// server.js

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

const db = mongoose.connection;

// Mongoose Schema and Model
const fileItemSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String, required: true }
});

const FileItem = mongoose.model('FileItem', fileItemSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/'); // upload files to 'uploads' directory
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + '-' + file.originalname); // unique file name
  }
});
const upload = multer({ storage: storage });

// CRUD endpoints
app.get('/api/fileItems', async (req, res) => {
  try {
    const fileItems = await FileItem.find();
    res.json(fileItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/fileItems', upload.single('file'), async (req, res) => {
  const newFileItem = new FileItem({
    filename: req.file.originalname,
    filePath: req.file.path
  });

  try {
    const savedFileItem = await newFileItem.save();
    res.status(201).json(savedFileItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/fileItems/:id', async (req, res) => {
  try {
    const fileItem = await FileItem.findById(req.params.id);
    if (!fileItem) {
      return res.status(404).json({ message: 'File item not found' });
    }
    await fileItem.remove();
    res.json({ message: 'File item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// Start server
db.once('open', () => {
  console.log('MongoDB connection established');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
