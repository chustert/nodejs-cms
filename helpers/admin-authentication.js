module.exports = {
    adminAuthenticated: function(req, res, next) {
        if(req.user.role === 'admin') {
            return next();
        } else {
            return res.status(401).json({
                msg: "You don't have access",
            });
        }
    }
}