
let express = require('express');
let router = express.Router();
let { users } = require('../models/users');

// View all users
router.get("/viewusers", async (req, res) => {
    try {
        let result = await users.find().select('-password');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: "Error fetching users", error: error.message });
    }
});

// View a particular user
router.get("/viewuser/:id", async (req, res) => {
    try {
        let result = await users.findById(req.params.id).select('-password');

        if (!result) {
            return res.status(404).send("User not found");
        }

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: "Error fetching user", error: error.message });
    }
});

// Delete a user
router.delete("/deleteuser/:id", async (req, res) => {
    try {
        let result = await users.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).send("User not found");
        }

        res.status(200).send("User deleted successfully");
    } catch (error) {
        res.status(500).send({ message: "Error deleting user", error: error.message });
    }
});

// Admin dashboard statistics
router.get("/dashboard", async (req, res) => {
    try {
        let totalUsers = await users.countDocuments();

        res.status(200).send({
            totalUsers: totalUsers,
            message: "Dashboard data fetched successfully"
        });
    } catch (error) {
        res.status(500).send({ message: "Dashboard error", error: error.message });
    }
});

module.exports = router;
