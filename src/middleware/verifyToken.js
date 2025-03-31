const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next)=> {
    try {
        // Check for token in Authorization header
        const authHeader = req.headers.authorization;
        let token;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            // Fallback to checking cookies
            token = req.cookies.token;
        }

        if(!token) {
            return res.status(401).send({message: "No token provided"})
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if(!decoded){
            return res.status(401).send({message: "Invalid token"})
        }
        
        req.user = decoded;
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error){
        console.error('Error while verifying token:', error);
        res.status(401).send({message: 'Error while verifying token'})
    }
}

module.exports = verifyToken;