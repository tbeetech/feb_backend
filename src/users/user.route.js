const express = require('express');
const User = require('./user.model')
const router = express.Router();
const generateToken = require('../middleware/generateToken')


// Define your routes here
router.get('/example', (req, res) => {
    res.send('User route example');
});

router.post('/register', async (req, res) => {
        try {
                const { username, email, password } = req.body;
                const user = new User({ email, username, password });
                await user.save();
                res.status(201).send({ message: "User created successfully" })
        } catch (error) {
                console.error("error registering user", error)
                res.status(500).send({ message: "Error registering user" })
        }
})

router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        try {
                const user = await User.findOne({ email });
                if (!user) {
                        return res.status(404).send({ message: "User not found" })
                }
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                        return res.status(401).send({ message: "password incorrect" })
                }
                const token = await generateToken(user._id)
                res.cookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'None'
                })
                console.log(token)
                res.status(200).send({
                        message: "Logged in!", token, user: {
                                _id: user._id,
                                email: user.email,
                                username: user.username,
                                role: user.role,
                                profileImage: user.profileImage,
                                bio: user.bio
                        }
                })
        } catch (error) {
                console.error("login error", error)
                res.status(500).send({ message: "Login error" })
        }


})
router.post('/logout', (req, res) => {
        res.clearCookie('token');
        res.status(200).send({ message: "logged out successfully" })
})
router.delete('/users/:id', async (req, res) => {
        try {
                const { id } = req.params;
                const user = await User.findByIdAndDelete(id);
                if (!user) {
                        return res.status(404).send({ message: "user not found" })
                }
                res.status(200).send({ message: "user deleted successfully" })
        } catch (error) {
                console.error("error deleting user", error);
                res.status(500).send({ message: "Error deleting user" })
        }
})

router.get('/users', async (req, res) => {
        try {
                const users = await User.find({}, 'id email role').sort({ createdAt: -1 });
                res.status(200).send(users)
        } catch (error) {
                console.error("Error fetching users", error);
                res.status(500).send({ message: "Error fetching user" },)
        }
})

router.put('/users/:id', async (req, res) => {
        try {
                const { id } = req.params;
                const { role } = req.body;
                const user = await User.findByIdAndUpdate(id, { role }, { new: true });
                if (!user) {
                        return res.status(404).send({ message: 'User not found' })
                }
                res.status(200).send({ message: "user role updated successfully", user })
        } catch (error) {
                console.error('Error updating user role', error);
                res.status(500).send({ message: "Error updating user role" })
        }
})

router.patch('/edit-profile', async (req, res) => {
        try {
                const { userId, username, profileImage, bio, profession } = req.body;
                if (!userId) {
                        return res.status(400).send({ message: 'User ID is required' })
                }
                const user = await User.findById(userId);

                if (!user) {
                        return res.status(400).send({ message: "User not found" })
                }

                if (username !== undefined) user.username = username;
                if (profileImage !== undefined) user.profileImage = profileImage;
                if (bio !== undefined) user.bio = bio;
                await user.save();
                res.status(200).send({
                        message: "profile updated successfully",
                        user: {
                                _id: user._id,
                                email: user.email,
                                username: user.username,
                                role: user.role,
                                profileImage: user.profileImage,
                                bio: user.bio
                        }
                })

                console.log(user)
        } catch (error) {
                console.error("Error updating user", error)
                res.status(500).send({ message: "Error updating user profile", })
        }
})
module.exports = router;