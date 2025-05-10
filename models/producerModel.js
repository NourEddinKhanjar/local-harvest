// models/producerModel.js
const db = require('../db'); // Import the shared db connection

/**
 * Finds a producer by their phone number.
 * @param {string} phoneNumber
 * @returns {object|null} The producer object or null if not found.
 */
function findByPhoneNumber(phoneNumber) {
    try {
        const stmt = db.prepare('SELECT * FROM producers WHERE phone_number = ?');
        return stmt.get(phoneNumber);
    } catch (error) {
        console.error("Error in producerModel.findByPhoneNumber:", error);
        throw error; // Re-throw to be handled by the caller
    }
}

/**
 * Creates a new producer.
 * @param {string} name
 * @param {string} phoneNumber
 * @param {string} hashedPassword
 * @param {string} location
 * @returns {object} The result from the database operation (e.g., { changes: 1, lastInsertRowid: ... }).
 */
function create(name, phoneNumber, hashedPassword, location) {
    try {
        const stmt = db.prepare('INSERT INTO producers (name, phone_number, password, location) VALUES (?, ?, ?, ?)');
        return stmt.run(name, phoneNumber, hashedPassword, location);
    } catch (error) {
        console.error("Error in producerModel.create:", error);
        throw error;
    }
}

/**
 * Finds a producer by their ID. (Useful for getting producer details later)
 * @param {number} id
 * @returns {object|null} The producer object or null if not found.
 */
function findById(id) {
    try {
        const stmt = db.prepare('SELECT id, name, phone_number, location FROM producers WHERE id = ?');
        return stmt.get(id);
    } catch (error) {
        console.error("Error in producerModel.findById:", error);
        throw error;
    }
}


module.exports = {
    findByPhoneNumber,
    create,
    findById
};