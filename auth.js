// middleware/auth.js

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token received:", token); // Check if token is being received

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded); // Check the decoded payload
        req.user = decoded;
        console.log(req.user.id);
        next();
    } catch (error) {
        console.log("Token verification error:", error);
        return res.status(403).json({ message: 'Invalid token.' });
    }
};


module.exports = authenticateToken;
