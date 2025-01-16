// const multer = require("multer");

// // Multer Storage Configuration
// const storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, "uploads/"); // Ensure this folder exists
//   },
//   filename: (req, file, callback) => {
//     callback(null, Date.now() + "-" + file.originalname); // Add timestamp for unique filenames
//   },
// });

// // Multer Upload Middleware
// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, callback) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return callback(
//         new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed.")
//       );
//     }
//     callback(null, true);
//   },
// });

// module.exports = upload;

const multer = require("multer");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname); // Unique filenames
  },
});

// Multer Upload Middleware with File Filter
const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed.")
      );
    }
    callback(null, true);
  },
});

module.exports = upload;
