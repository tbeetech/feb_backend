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
            return res.status(401).json({ 
                success: false,
                message: "Authentication required. No token provided."
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            if(!decoded) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token. Please login again."
                });
            }
            
            req.user = decoded;
            req.userId = decoded.userId;
            req.role = decoded.role;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Your session has expired. Please login again."
                });
            }
            
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again."
            });
        }
    } catch (error){
        console.error('Error while verifying token:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error. Please try again.'
        });
    }
}

module.exports = verifyToken;