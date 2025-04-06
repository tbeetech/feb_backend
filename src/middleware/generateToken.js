const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const generateToken = async (userId) => {
    try{ 
        const user = await User.findById(userId);
        if(!user){
            throw new Error('User not found.');
        }
        
        // Create a payload with necessary user information
        const payload = {
            _id: user._id,
            userId: user._id, // Include both for backward compatibility
            username: user.username,
            email: user.email,
            role: user.role
        };
        
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: "24h", // Increased from 1h to 24h for better user experience
        });
        
        return token;
    } catch (error){
        console.error('Error generating token:', error);
        throw error; // Propagate the error to be handled by the caller
    }
}

module.exports = generateToken;
