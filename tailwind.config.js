// tailwind.config.js
module.exports = {
    content: [
        './views/**/*.ejs', // Adjust if your .ejs files are elsewhere
        './public/**/*.js', // If you have JS that manipulates classes
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/typography'),
        // ... other plugins
    ],
}