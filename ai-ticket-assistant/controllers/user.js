import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

/* =========================
   SIGNUP
========================= */
export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;

  try {
    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      email,
      password: hashedPassword,
      skills,
    });

    // fire inngest event
    await inngest.send({
      name: "user/signup",
      data: {
        userId: user._id.toString(),
        email: user.email,
      },
    });

    // create token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Signup successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      error: "Signup failed",
      details: error.message,
    });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // create token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      error: "Login failed",
      details: error.message,
    });
  }
};

/* =========================
   LOGOUT
========================= */
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, process.env.JWT_SECRET);

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

/* =========================
   UPDATE USER (ADMIN)
========================= */
export const updateUser = async (req, res) => {
  const { email, skills = [], role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.skills = skills.length ? skills : user.skills;
    if (role) user.role = role;

    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      error: "Update failed",
      details: error.message,
    });
  }
};


/* =========================
   GET USERS (ADMIN)
========================= */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      details: error.message,
    });
  }
};
