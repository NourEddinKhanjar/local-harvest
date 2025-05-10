const express = require('express');
const router = express.Router();
// const db = require('../db'); // No longer directly needed
const { isProducerAuthenticated } = require('../middleware/authMiddleware');
const productModel = require('../models/productModel'); // IMPORT THE MODEL
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ... (Multer setup remains the same)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { cb(null, true); }
    else { cb(new Error('Not an image! Please upload an image file.'), false); }
};
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFileFilter
}).single('productImage');


router.use(isProducerAuthenticated);

// Producer Dashboard
router.get('/dashboard', (req, res) => {
    res.render('producer/dashboard', { title: 'Producer Dashboard' });
});

// Show Add Product Form
router.get('/products/add', (req, res) => {
    res.render('producer/product-form', {
        title: 'Add New Product',
        product: {},
        formAction: '/producer/products/add',
        categories: req.app.locals.categories
    });
});

// Handle Add Product
router.post('/products/add', (req, res) => {
    upload(req, res, async function (err) { // Mark as async if model functions are async (they are not here, but good practice)
        if (err instanceof multer.MulterError) { /* ... */ }
        else if (err) { /* ... */ }

        const { name, description, price, quantity_available, category } = req.body;
        const producer_id = req.session.producerId;
        const image_filename = req.file ? req.file.filename : null;

        if (!name || !price || !category) {
            req.flash('error_msg', 'Name, price, and category are required.');
            if (image_filename) fs.unlink(path.join(__dirname, '../public/uploads/', image_filename), () => {});
            return res.redirect('/producer/products/add');
        }

        try {
            const productData = { producer_id, name, description, price, quantity_available, category, image_filename };
            productModel.create(productData); // USE MODEL
            req.flash('success_msg', 'Product added successfully!');
            res.redirect('/producer/products');
        } catch (error) {
            console.error("Error adding product in route:", error);
            req.flash('error_msg', 'Failed to add product. Please try again.');
            if (image_filename) fs.unlink(path.join(__dirname, '../public/uploads/', image_filename), () => {});
            res.redirect('/producer/products/add');
        }
    });
});

// View/Manage Producer's Products
router.get('/products', (req, res) => {
    try {
        const products = productModel.findByProducerId(req.session.producerId); // USE MODEL
        res.render('producer/manage-products', { title: 'Manage Your Products', products });
    } catch (error) {
        console.error("Error fetching producer products in route:", error);
        req.flash('error_msg', 'Could not load your products.');
        res.render('producer/manage-products', { title: 'Manage Your Products', products: [] });
    }
});

// Show Edit Product Form
router.get('/products/edit/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    try {
        const product = productModel.findByIdAndProducerId(productId, req.session.producerId); // USE MODEL

        if (product) {
            res.render('producer/product-form', {
                title: 'Edit Product',
                product,
                formAction: `/producer/products/edit/${productId}`,
                categories: req.app.locals.categories
            });
        } else {
            req.flash('error_msg', 'Product not found or you do not have permission to edit it.');
            res.redirect('/producer/products');
        }
    } catch (error) {
        console.error("Error fetching product for edit in route:", error);
        req.flash('error_msg', 'Could not load product for editing.');
        res.redirect('/producer/products');
    }
});

// Handle Edit Product
router.post('/products/edit/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    upload(req, res, async function (err) { // Mark as async
        if (err instanceof multer.MulterError) { /* ... */ }
        else if (err) { /* ... */ }

        const { name, description, price, quantity_available, category, currentImage } = req.body;
        const producer_id = req.session.producerId;
        let image_filename = req.file ? req.file.filename : currentImage;

        if (!name || !price || !category) {
            req.flash('error_msg', 'Name, price, and category are required.');
            if (req.file) fs.unlink(path.join(__dirname, '../public/uploads/', req.file.filename), () => {});
            return res.redirect(`/producer/products/edit/${productId}`);
        }

        try {
            if (req.file && currentImage && currentImage !== req.file.filename) {
                const oldImagePath = path.join(__dirname, '../public/uploads/', currentImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (unlinkErr) => {
                        if (unlinkErr) console.error("Error deleting old image:", unlinkErr);
                    });
                }
            }

            const productData = { name, description, price, quantity_available, category, image_filename };
            const info = productModel.update(productId, producer_id, productData); // USE MODEL

            if (info.changes > 0) {
                req.flash('success_msg', 'Product updated successfully!');
            } else {
                req.flash('error_msg', 'Product not found or no changes made.');
                if (req.file) fs.unlink(path.join(__dirname, '../public/uploads/', req.file.filename), () => {});
            }
            res.redirect('/producer/products');

        } catch (error) {
            console.error("Error updating product in route:", error);
            req.flash('error_msg', 'Failed to update product. Please try again.');
            if (req.file) fs.unlink(path.join(__dirname, '../public/uploads/', req.file.filename), () => {});
            res.redirect(`/producer/products/edit/${productId}`);
        }
    });
});

// Handle Delete Product
router.post('/products/delete/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const producer_id = req.session.producerId;

    try {
        const productToDelete = productModel.getImageFilename(productId, producer_id); // USE MODEL to get image
        const info = productModel.deleteByIdAndProducerId(productId, producer_id); // USE MODEL to delete

        if (info.changes > 0) {
            if (productToDelete && productToDelete.image_filename) {
                const imagePath = path.join(__dirname, '../public/uploads/', productToDelete.image_filename);
                if (fs.existsSync(imagePath)) {
                    fs.unlink(imagePath, (err) => {
                        if (err) console.error("Error deleting product image:", err);
                    });
                }
            }
            req.flash('success_msg', 'Product deleted successfully.');
        } else {
            req.flash('error_msg', 'Product not found or you do not have permission to delete it.');
        }
        res.redirect('/producer/products');
    } catch (error) {
        console.error("Error deleting product in route:", error);
        req.flash('error_msg', 'Failed to delete product. Please try again.');
        res.redirect('/producer/products');
    }
});

module.exports = router;