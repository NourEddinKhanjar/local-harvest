-- Producers Table
CREATE TABLE IF NOT EXISTS producers (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         name TEXT NOT NULL,
                                         phone_number TEXT NOT NULL UNIQUE,
                                         password TEXT NOT NULL,
                                         location TEXT,
                                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        producer_id INTEGER NOT NULL,
                                        name TEXT NOT NULL,
                                        description TEXT,
                                        price REAL NOT NULL,
                                        quantity_available TEXT,
                                        category TEXT NOT NULL,
                                        image_filename TEXT, -- Stores the name of the uploaded image file
                                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE
    );

-- Trigger to update 'updated_at' timestamp on product update
CREATE TRIGGER IF NOT EXISTS update_product_updated_at
AFTER UPDATE ON products
                            FOR EACH ROW
BEGIN
UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;