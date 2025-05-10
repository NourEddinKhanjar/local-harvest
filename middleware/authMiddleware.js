// Middleware to check if a producer is authenticated
function isProducerAuthenticated(req, res, next) {
    if (req.session.producerId) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view this resource.');
    res.redirect('/auth/login');
}

module.exports = { isProducerAuthenticated };