require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');

const db = require('./db'); // Initializes DB connection and schema

const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const producerRoutes = require('./routes/producerRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// App constants
const CATEGORIES = ["Vegetables", "Fruits", "Baked Goods", "Crafts", "Dairy & Eggs", "Meats", "Other"];
app.locals.categories = CATEGORIES; // Make categories available in all templates
app.locals.siteTitle = "Local Harvest & Handmade Connect";
app.locals.adminContactInfo = process.env.ADMIN_CONTACT_INFO || "Contact Admin via site.";


// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(express.json()); // Parses JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_default_fallback_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Flash messages middleware
app.use(flash());

// Middleware to make flash messages and session data available to all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.session.producerId ? { id: req.session.producerId, name: req.session.producerName } : null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // For passport compatibility or general errors
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/producer', producerRoutes);

// Basic 404 handler
app.use((req, res, next) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'Sorry, the page you are looking for does not exist.'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});