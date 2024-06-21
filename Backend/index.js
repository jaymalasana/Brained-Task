const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();

mongoose.connect("mongodb://localhost:27017/imageCrudDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const imageSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
});
const Image = mongoose.model("Image", imageSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/api/images", async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/images", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { title, description } = req.body;
  const imageUrl = req.file.path;

  const newImage = new Image({ title, description, imageUrl });

  try {
    const savedImage = await newImage.save();
    res.status(201).json(savedImage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/images/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;

  try {
    const imageToUpdate = await Image.findById(id);
    if (!imageToUpdate) {
      return res.status(404).json({ message: "Image not found" });
    }

    if (req.file) {
      fs.unlinkSync(imageToUpdate.imageUrl);
      imageToUpdate.imageUrl = req.file.path;
    }

    imageToUpdate.title = title;
    imageToUpdate.description = description;

    const updatedImage = await imageToUpdate.save();
    res.json(updatedImage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/images/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deletedImage = await Image.findByIdAndDelete(id);
    if (!deletedImage) {
      return res.status(404).json({ message: "Image not found" });
    }
    fs.unlinkSync(deletedImage.imageUrl);
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(5000);
