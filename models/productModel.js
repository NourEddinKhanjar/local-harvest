// models/productModel.js
const db = require('../db');

/**
 * Gets all recent products with producer information.
 * @param {number} limit - Max number of products to fetch.
 * @returns {Array} Array of product objects.
 */
function getRecentWithProducerInfo(limit = 20) {
    try {
        const stmt = db.prepare(`
            SELECT p.*, pr.name as producer_name, pr.location as producer_location, pr.phone_number as producer_phone
            FROM products p
            JOIN producers pr ON p.producer_id = pr.id
            ORDER BY p.created_at DESC
            LIMIT ?
        `);
        return stmt.all(limit);
    } catch (error) {
        console.error("Error in productModel.getRecentWithProducerInfo:", error);
        throw error;
    }
}

/**
 * Finds products by category with producer information.
 * @param {string} categoryName
 * @returns {Array} Array of product objects.
 */
function findByCategoryWithProducerInfo(categoryName) {
    try {
        const stmt = db.prepare(`
            SELECT p.*, pr.name as producer_name, pr.location as producer_location, pr.phone_number as producer_phone
            FROM products p
            JOIN producers pr ON p.producer_id = pr.id
            WHERE p.category = ?
            ORDER BY p.created_at DESC
        `);
        return stmt.all(categoryName);
    } catch (error) {
        console.error("Error in productModel.findByCategoryWithProducerInfo:", error);
        throw error;
    }
}

/**
 * Finds a single product by ID with producer information.
 * @param {number} productId
 * @returns {object|null} Product object or null.
 */
function findByIdWithProducerInfo(productId) {
    try {
        const stmt = db.prepare(`
            SELECT p.*, pr.name as producer_name, pr.location as producer_location, pr.phone_number as producer_phone
            FROM products p
            JOIN producers pr ON p.producer_id = pr.id
            WHERE p.id = ?
        `);
        return stmt.get(productId);
    } catch (error) {
        console.error("Error in productModel.findByIdWithProducerInfo:", error);
        throw error;
    }
}

/**
 * Searches products based on a query string, including producer info.
 * @param {string} query
 * @returns {Array} Array of matching product objects.
 */
function searchWithProducerInfo(query) {
    try {
        const searchQuery = `%${query}%`;
        const stmt = db.prepare(`
            SELECT p.*, pr.name as producer_name, pr.location as producer_location, pr.phone_number as producer_phone
            FROM products p
            JOIN producers pr ON p.producer_id = pr.id
            WHERE p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR pr.name LIKE ? OR pr.location LIKE ?
            ORDER BY p.created_at DESC
        `);
        return stmt.all(searchQuery, searchQuery, searchQuery, searchQuery, searchQuery);
    } catch (error) {
        console.error("Error in productModel.searchWithProducerInfo:", error);
        throw error;
    }
}

/**
 * Creates a new product.
 * @param {object} productData - { producer_id, name, description, price, quantity_available, category, image_filename }
 * @returns {object} Result of the insert operation.
 */
function create(productData) {
    try {
        const { producer_id, name, description, price, quantity_available, category, image_filename } = productData;
        const stmt = db.prepare(`
            INSERT INTO products (producer_id, name, description, price, quantity_available, category, image_filename)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(producer_id, name, description, parseFloat(price), quantity_available, category, image_filename);
    } catch (error) {
        console.error("Error in productModel.create:", error);
        throw error;
    }
}

/**
 * Finds all products for a specific producer.
 * @param {number} producerId
 * @returns {Array} Array of product objects.
 */
function findByProducerId(producerId) {
    try {
        const stmt = db.prepare('SELECT * FROM products WHERE producer_id = ? ORDER BY created_at DESC');
        return stmt.all(producerId);
    } catch (error) {
        console.error("Error in productModel.findByProducerId:", error);
        throw error;
    }
}

/**
 * Finds a single product by its ID and producer ID (for ownership check).
 * @param {number} productId
 * @param {number} producerId
 * @returns {object|null} Product object or null.
 */
function findByIdAndProducerId(productId, producerId) {
    try {
        const stmt = db.prepare('SELECT * FROM products WHERE id = ? AND producer_id = ?');
        return stmt.get(productId, producerId);
    } catch (error) {
        console.error("Error in productModel.findByIdAndProducerId:", error);
        throw error;
    }
}

/**
 * Updates an existing product.
 * @param {number} productId
 * @param {number} producerId
 * @param {object} productData - { name, description, price, quantity_available, category, image_filename }
 * @returns {object} Result of the update operation.
 */
function update(productId, producerId, productData) {
    try {
        const { name, description, price, quantity_available, category, image_filename } = productData;
        const stmt = db.prepare(`
            UPDATE products
            SET name = ?, description = ?, price = ?, quantity_available = ?, category = ?, image_filename = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND producer_id = ?
        `);
        return stmt.run(name, description, parseFloat(price), quantity_available, category, image_filename, productId, producerId);
    } catch (error) {
        console.error("Error in productModel.update:", error);
        throw error;
    }
}

/**
 * Gets the image filename for a product (to assist with file deletion).
 * @param {number} productId
 * @param {number} producerId
 * @returns {object|null} Object with image_filename or null.
 */
function getImageFilename(productId, producerId) {
    try {
        const stmt = db.prepare('SELECT image_filename FROM products WHERE id = ? AND producer_id = ?');
        return stmt.get(productId, producerId);
    } catch (error) {
        console.error("Error in productModel.getImageFilename:", error);
        throw error;
    }
}

/**
 * Deletes a product by its ID and producer ID.
 * @param {number} productId
 * @param {number} producerId
 * @returns {object} Result of the delete operation.
 */
function deleteByIdAndProducerId(productId, producerId) {
    try {
        const stmt = db.prepare('DELETE FROM products WHERE id = ? AND producer_id = ?');
        return stmt.run(productId, producerId);
    } catch (error) {
        console.error("Error in productModel.deleteByIdAndProducerId:", error);
        throw error;
    }
}

module.exports = {
    getRecentWithProducerInfo,
    findByCategoryWithProducerInfo,
    findByIdWithProducerInfo,
    searchWithProducerInfo,
    create,
    findByProducerId,
    findByIdAndProducerId,
    update,
    getImageFilename,
    deleteByIdAndProducerId
};