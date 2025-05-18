
⚠️ Warning

This project is fully built by AI

## Setup and Installation

**Prerequisites:**
*   [Node.js](https://nodejs.org/) (which includes npm) installed on your system (LTS version recommended).
*   (Optional but Recommended) A GUI tool for SQLite database browsing, like [DB Browser for SQLite](https://sqlitebrowser.org/).

**Steps:**

1.  **Clone the Repository (if applicable) or Download the Code:**
    ```bash
    # If using Git
    git clone <repository-url>
    cd local-harvest-connect
    ```

2.  **Install Dependencies:**
    Navigate to the project's root directory (`local-harvest-connect/`) in your terminal and run:
    ```bash
    npm install
    ```
    This will install all the packages listed in `package.json`.

3.  **Set Up Environment Variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   Open the newly created `.env` file in a text editor.
    *   Modify the variables as needed:
        *   `SESSION_SECRET`: **Crucial for security.** Change this to a long, random, and unique string (at least 32 characters). You can use an online generator for strong secrets.
        *   `PORT`: The port the application will run on (defaults to 3000 if not set or if `.env` is missing).
        *   `ADMIN_CONTACT_INFO`: Contact information displayed on the "Contact Us" page (e.g., an email address or admin phone number).
        *   `NODE_ENV`: Set to `production` when deploying, or `development` locally. This affects things like secure cookies.

4.  **Database Initialization:**
    The SQLite database file (`local_harvest.sqlite`) and its schema will be automatically created in the project root directory the first time you run the application, thanks to the `db.js` and `database.sql` files.

5.  **Create Uploads Directory (if not automatically handled by Multer setup):**
    The `multer` setup in `producerRoutes.js` attempts to create this directory (`public/uploads/`) if it doesn't exist. However, if you encounter permission issues, you might need to create it manually:
    ```bash
    mkdir -p public/uploads
    ```
    Ensure your Node.js application has write permissions to this directory.

## Running the Application

1.  **Start the Server (Development Mode):**
    This command uses `nodemon` to automatically restart the server when file changes are detected.
    ```bash
    npm run dev
    ```

2.  **Start the Server (Production Mode):**
    This command runs the server using `node` directly. Make sure `NODE_ENV=production` is set in your `.env` file or system environment for production deployments.
    ```bash
    npm start
    ```

3.  **Access the Website:**
    Open your web browser and navigate to:
    `http://localhost:<PORT>`
    (e.g., `http://localhost:3000` if using the default port).

## Viewing the Database (SQLite)

You can inspect the contents of the `local_harvest.sqlite` database file using:

*   **SQLite Command-Line Interface (`sqlite3`):**
    ```bash
    sqlite3 local_harvest.sqlite
    ```
    Then use commands like `.tables`, `SELECT * FROM products;`, etc.
*   **GUI Tool (Recommended):**
    Use a tool like [DB Browser for SQLite](https://sqlitebrowser.org/). Open the `local_harvest.sqlite` file located in the project root.

## Future Enhancements / Considerations

*   **Client-side Image Resizing:** To reduce upload bandwidth for users with slow connections.
*   **More Advanced Search/Filtering:** Beyond basic keyword and category.
*   **Internationalization (i18n):** Support for multiple languages.
*   **Admin Panel:** A basic interface for site administrators to manage users or content (if needed, though the MVP aims for simplicity).
*   **Deployment:** Consider platforms like Heroku, DigitalOcean, or shared hosting with Node.js support. Remember to configure HTTPS for production.
*   **Testing:** Implement unit and integration tests.

## Contribution

This project is designed as a minimal MVP. If you wish to contribute:
1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Submit a pull request with a clear description of your changes.

## License

MIT License
