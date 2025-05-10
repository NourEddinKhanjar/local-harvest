const express = require('express');
const router = express.Router();
// const db = require('../db'); // No longer directly needed
const productModel = require('../models/productModel'); // IMPORT THE MODEL

// Homepage - Display recent products
router.get('/', (req, res) => {
    try {
        const products = productModel.getRecentWithProducerInfo(20); // USE MODEL
        res.render('index', { title: 'Welcome', products });
    } catch (error) {
        console.error("Error fetching homepage products in route:", error);
        req.flash('error_msg', 'Could not load products. Please try again later.');
        res.render('index', { title: 'Welcome', products: [] });
    }
});

// Category Browse Page
router.get('/category/:categoryName', (req, res) => {
    const categoryName = req.params.categoryName;
    try {
        const products = productModel.findByCategoryWithProducerInfo(categoryName); // USE MODEL
        res.render('category', { title: `Category: ${categoryName}`, products, categoryName });
    } catch (error) {
        console.error(`Error fetching products for category ${categoryName} in route:`, error);
        req.flash('error_msg', 'Could not load products for this category.');
        res.redirect('/');
    }
});

// Product Detail Page
router.get('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    try {
        const product = productModel.findByIdWithProducerInfo(productId); // USE MODEL
        if (product) {
            res.render('product-detail', { title: product.name, product });
        } else {
            req.flash('error_msg', 'Product not found.');
            res.status(404).render('error', { title: 'Product Not Found', message: 'The product you are looking for does not exist.'});
        }
    } catch (error) {
        console.error(`Error fetching product ${productId} in route:`, error);
        req.flash('error_msg', 'Could not load product details.');
        res.redirect('/');
    }
});

// Search products
router.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.redirect('/');
    }
    try {
        const products = productModel.searchWithProducerInfo(query); // USE MODEL
        res.render('search-results', { title: `Search Results for "${query}"`, products, query });
    } catch (error) {
        console.error("Search error in route:", error);
        req.flash('error_msg', 'Error performing search.');
        res.render('search-results', { title: `Search Results for "${query}"`, products: [], query });
    }
});


// Static Pages (remain unchanged as they don't interact with DB directly here)
router.get('/how-it-works', (req, res) => {
    res.render('static/how-it-works', { title: 'How It Works' });
});

router.get('/about-us', (req, res) => {
    res.render('static/about-us', { title: 'About Us' });
});

router.get('/contact-us', (req, res) => {
    res.render('static/contact-us', { title: 'Contact Us' });
});

module.exports = router;