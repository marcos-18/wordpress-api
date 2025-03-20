const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../Models/User');
const UserMeta = require('../Models/UserMeta');
const { userSchema } = require('../Validations/userValidation');
const { getUsersWithDetails, getSingleUserDetails } = require("../Aggregations/userAggregations");

const DEFAULT_CUSTOMER_ROLE_ID = new mongoose.Types.ObjectId('67d811f76bc807b2739977d8'); // Default "Customer" role

const registerUser = async(req, res) => {
    try {
        let { first_name, last_name, user_email, user_pass, user_role, user_status } = req.body;

        // Validate request body
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ user_email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Ensure user_role is a valid ObjectId, or use the default customer role
        const assignedUserRole = mongoose.isValidObjectId(user_role) ? user_role : DEFAULT_CUSTOMER_ROLE_ID;

        // Generate unique user_login
        let baseLogin = `${first_name.toLowerCase()}.${last_name.toLowerCase()}`;
        let userLogin = baseLogin;
        let count = 1;

        while (await User.findOne({ user_login: userLogin })) {
            userLogin = `${baseLogin}${count}`;
            count++;
        }


        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(user_pass, 10);


        // Create User
        const newUser = new User({
            user_login: userLogin,
            first_name,
            last_name,
            user_pass: hashedPassword,
            user_email,
            user_role: assignedUserRole,
            user_status: user_status !== undefined ? user_status : false,
            display_name: `${first_name} ${last_name}`
        });

        await newUser.save();


        // Insert first_name & last_name into usermeta
        await UserMeta.insertMany([
            { user_id: newUser._id, meta_key: 'first_name', meta_value: first_name },
            { user_id: newUser._id, meta_key: 'last_name', meta_value: last_name }
        ]);

        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async(req, res) => {
    try {
        const { user_email, user_pass } = req.body;

        // Check if user exists
        const user = await User.findOne({ user_email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        // Check password
        const isMatch = await bcrypt.compare(user_pass, user.user_pass);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, user_email: user.user_email },
            process.env.JWT_SECRET, // Use process.env to get the secret
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error); // Log full error
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const getUserslist = async(req, res) => {
    try {
        const users = await User.find({}, { user_pass: 0, __v: 0 }); // Fetch users, hide password & version

        res.status(200).json({ success: true, users }); // Add success flag for better API response
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

const getUserMeta = async(req, res) => {
    try {
        let { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const userMeta = await UserMeta.find({ user_id });

        res.status(200).json({ success: true, userMeta });
    } catch (error) {
        console.error("Error fetching user meta:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

const getUserslistwithrole = async(req, res) => {
    try {
        const users = await getUsersWithDetails(); // Call the function to get users

        res.status(200).json({ success: true, users }); // Add success flag for better API response
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

const getsingleuserdetails = async(req, res) => {
    try {
        let { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await getSingleUserDetails(user_id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

module.exports = { registerUser, getUserslist, getUserMeta, getUserslistwithrole, login, getsingleuserdetails };