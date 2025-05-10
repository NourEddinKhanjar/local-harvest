const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
// const db = require('../db'); // No longer directly needed here
const producerModel = require('../models/producerModel'); // IMPORT THE MODEL

// Show Registration Form
router.get('/register', (req, res) => {
    if (req.session.producerId) return res.redirect('/producer/dashboard');
    res.render('register', { title: 'Producer Registration' });
});

// Handle Registration
router.post('/register', async (req, res) => {
    const { name, phone_number, password, password2, location } = req.body;
    let errors = [];

    // ... (keep existing validation logic)
    if (!name || !phone_number || !password || !password2 || !location) {
        errors.push({ msg: 'Please fill in all fields.' });
    }
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match.' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters.' });
    }
    if (!/^\+?[0-9\s-]{7,15}$/.test(phone_number)) {
        errors.push({ msg: 'Please enter a valid phone number.' });
    }

    if (errors.length > 0) {
        return res.render('register', {
            title: 'Producer Registration',
            errors, name, phone_number, location
        });
    }

    try {
        const existingProducer = producerModel.findByPhoneNumber(phone_number); // USE MODEL

        if (existingProducer) {
            errors.push({ msg: 'Phone number already registered.' });
            return res.render('register', {
                title: 'Producer Registration',
                errors, name, phone_number, location
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const info = producerModel.create(name, phone_number, hashedPassword, location); // USE MODEL

        if (info.changes > 0) {
            req.flash('success_msg', 'You are now registered and can log in.');
            res.redirect('/auth/login');
        } else {
            throw new Error('Producer registration failed.');
        }
    } catch (error) {
        console.error("Registration error in route:", error); // Log the error caught from the model
        errors.push({ msg: 'Something went wrong during registration. Please try again.' });
        res.render('register', {
            title: 'Producer Registration',
            errors, name, phone_number, location
        });
    }
});

// Show Login Form
router.get('/login', (req, res) => {
    if (req.session.producerId) return res.redirect('/producer/dashboard');
    res.render('login', { title: 'Producer Login' });
});

// Handle Login
router.post('/login', async (req, res) => {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
        req.flash('error_msg', 'Please fill in all fields.');
        return res.redirect('/auth/login');
    }

    try {
        const producer = producerModel.findByPhoneNumber(phone_number); // USE MODEL

        if (!producer) {
            req.flash('error_msg', 'That phone number is not registered.');
            return res.redirect('/auth/login');
        }

        const isMatch = await bcrypt.compare(password, producer.password);
        if (isMatch) {
            req.session.producerId = producer.id;
            req.session.producerName = producer.name;
            req.flash('success_msg', 'Login successful! Welcome.');
            res.redirect('/producer/dashboard');
        } else {
            req.flash('error_msg', 'Password incorrect.');
            res.redirect('/auth/login');
        }
    } catch (error) {
        console.error("Login error in route:", error);
        req.flash('error_msg', 'Something went wrong during login.');
        res.redirect('/auth/login');
    }
});

// Handle Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error:", err);
            req.flash('error_msg', 'Could not log out. Please try again.');
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        req.flash('success_msg', 'You are logged out.');
        res.redirect('/auth/login');
    });
});

module.exports = router;