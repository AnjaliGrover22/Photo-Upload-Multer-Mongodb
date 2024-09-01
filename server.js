const Image = require("./schemas/Image");
require("dotenv").config();
const PORT = process.env.PORT || 8085;

const express = require("express");
const connectDB = require("./dbinit");

const path = require("path");
const multer = require("multer");
const app = express();
connectDB();
//static keyword is used to serve static files like images/files directly to the client, _dirname tells the current folder name, path deals with whole path
app.use("/upload", express.static(path.join(__dirname, "upload")));

// Set up multer storage configuration,where we created destination nd filename function which gives info to the multer in req, file (seperation of concerns thats why use req and file again).cb is the multer inbuilt own callback function which then decide nad configure photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

//creates a multer instance with a specified storage configuration
const upload = multer({ storage: storage });

//serve a simple HTML form at the root route
app.get("/", (req, res) => {
  res.send(`
    <h1>Upload an Image</h1>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="image" />
       <input type="text" name="desc" placeholder="Image description" />
      <button type="submit">Upload</button>
    </form>
    
    `);
});

// Endpoint to handle file uploads, Routes define here only (only schemas created in another folder)
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("I am going to upload the images using only multer");
    if (req.file) {
      //I added MVC Controller here only to make the code simple: it creates document type of image metadata on mongo db
      const image = new Image({
        description: req.body.desc || "No description",
        url: req.file.path,
      });
      await image.save(); // Save image metadata to MongoDB
      res
        .status(200)
        .json({ message: "Image uploaded successfully", file: req.file });
    } else {
      res.status(400).json({ error: "No file uploaded" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred during the upload" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

//multer handles the file upload process, saving the file to the disk (or memory) and making file information available in the request object.
//express.static serves the uploaded files to clients by mapping URLs to files stored in a directory.
//mvc helped to make these image's metadata avaialble onmongodb as docs
