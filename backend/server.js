
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test the database connection
app.get("/", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.send("Backend and MySQL connected!");
  } catch (error) {
    console.error("MYSQL ERROR:", error);
    res.status(500).send("Database connection failed. Check VS Code terminal.");
  }
});

// SIGNUP

app.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      city,
      pincode
    } = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !city ||
      !pincode
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields."
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        message: "Enter a valid 6-digit pincode."
      });
    }

    // Check if email already exists
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Email already registered. Please sign in."
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save user details in MySQL
    await db.execute(
      `INSERT INTO users
       (name, email, password, phone, city, pincode)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        phone,
        city,
        pincode
      ]
    );

    return res.status(201).json({
      message: "Account created successfully! Please sign in."
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email already registered. Please sign in."
      });
    }

    return res.status(500).json({
      message: "Signup failed. Please try again."
    });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const [users] = await db.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
