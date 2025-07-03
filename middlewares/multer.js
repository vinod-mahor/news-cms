// Import the multer and path modules
const multer = require('multer');
const path = require('path');
const fs = require("fs")

// Set up where and how files will be saved
const storage = multer.diskStorage({

    // destination: path.join(__dirname, '../public/uploads/'),
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/'));
    },
    // Rename the file to use the current time + original extension
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Only allow image files to be uploaded
function fileFilter(req, file, cb) {
    // Allowed file types
    const allowedTypes = ['.jpeg', '.jpg', '.png'];
    // Get the file extension
    const ext = path.extname(file.originalname).toLowerCase();
    // Check if the extension is allowed
    if (allowedTypes.includes(ext)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only image files are allowed!'), false); // Reject the file
    }
}
// Set up multer with our storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Export the upload object so it can be used in other files
module.exports = upload;