
const express = require('express');
const mongoose = require('mongoose')
const path = require('path')
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const cookie = require('cookie-parser');
const expressLayout = require('express-ejs-layouts');
const flash = require('connect-flash')
const adminRoutes = require('./routes/adminRoute.js');
const frontedndRoutes = require('./routes/frontendRoute.js')



dotenv.config(); // Load environment variables from .env file

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayout);
app.set("layout", "frontend/layout");
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(cookie());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// data base connection


const PORT = process.env.PORT || 3000;
// Middleware to parse JSON bodies

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("::::::: DATABASE CONNECTED :::::::: ");
    })
    .catch((err) => {
        console.error("Database connection error:", err);
    });


// routes
app.use("/", frontedndRoutes);
app.use("/admin", (req, res, next) => {
    res.locals.layout = "admin/layout";
    next();
});
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});