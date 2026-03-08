import express from "express";
import db from "./db.js";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to parse JSON fields from database
const parseJsonFields = (obj) => {
  if (!obj) return obj;
  const parsed = { ...obj };
  if (parsed.skills && typeof parsed.skills === "string") {
    try {
      parsed.skills = JSON.parse(parsed.skills);
    } catch {
      parsed.skills = [];
    }
  }
  if (parsed.interests && typeof parsed.interests === "string") {
    try {
      parsed.interests = JSON.parse(parsed.interests);
    } catch {
      parsed.interests = [];
    }
  }
  if (parsed.terms && typeof parsed.terms === "string") {
    try {
      parsed.terms = JSON.parse(parsed.terms);
    } catch {
      parsed.terms = [];
    }
  }
  if (parsed.skills_needed && typeof parsed.skills_needed === "string") {
    try {
      parsed.skills_needed = JSON.parse(parsed.skills_needed);
    } catch {
      parsed.skills_needed = [];
    }
  }
  return parsed;
};

app.get("/", (req, res) => {
  res.json({ message: "uw-plork API is running!" });
});

// Login endpoint
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      userId: user.id,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/** USERS!!!*/

// Create user
app.post("/users", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      discipline,
      year,
      skills,
      interests,
      commitment,
      github,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO users (name, email, password, discipline, year, skills, interests, commitment, github)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        discipline,
        year,
        JSON.stringify(skills),
        JSON.stringify(interests),
        commitment,
        github,
      ],
    );
    res.json({ message: "User created!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  const [users] = await db.execute("SELECT * FROM users");
  res.json(users);
});

// Get user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(parseJsonFields(users[0]));
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update user
app.put("/users/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      discipline,
      year,
      skills,
      interests,
      commitment,
      github,
    } = req.body;

    let updateQuery = `UPDATE users SET name = ?, email = ?, discipline = ?, year = ?, skills = ?, interests = ?, commitment = ?, github = ?`;
    let params = [
      name,
      email,
      discipline,
      year,
      JSON.stringify(skills),
      JSON.stringify(interests),
      commitment,
      github,
      req.params.id,
    ];

    // If password is provided, hash it and update
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `UPDATE users SET name = ?, email = ?, password = ?, discipline = ?, year = ?, skills = ?, interests = ?, commitment = ?, github = ?`;
      params = [
        name,
        email,
        hashedPassword,
        discipline,
        year,
        JSON.stringify(skills),
        JSON.stringify(interests),
        commitment,
        github,
        req.params.id,
      ];
    }

    updateQuery += ` WHERE id = ?`;
    await db.execute(updateQuery, params);
    const [users] = await db.execute(
      "SELECT id, name, email, discipline, year, skills, interests, commitment, github, created_at FROM users WHERE id = ?",
      [req.params.id],
    );
    res.json(parseJsonFields(users[0]));
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

/** POST!!!!!!!!!!!!!!!!!!!!!!!! */

// Create a post
app.post("/posts", async (req, res) => {
  try {
    const {
      poster_id,
      title,
      description,
      skills_needed,
      commitment,
      spots,
      deadline,
    } = req.body;

    if (!poster_id || !title) {
      return res
        .status(400)
        .json({ error: "poster_id and title are required" });
    }

    const [result] = await db.execute(
      `INSERT INTO posts (poster_id, title, description, skills_needed, commitment, spots, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        poster_id,
        title,
        description || "",
        JSON.stringify(skills_needed || []),
        commitment || null,
        spots || 1,
        deadline || null,
      ],
    );

    // Return the created post with its ID
    const [posts] = await db.execute(
      `SELECT p.*, u.name as poster_name, u.discipline, u.year
      FROM posts p
      JOIN users u ON p.poster_id = u.id
      WHERE p.id = ?`,
      [result.insertId],
    );

    const post = posts[0] || {
      id: result.insertId,
      title: title,
      description: description,
    };
    res.json(parseJsonFields(post));
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({ error: "Failed to create post", details: error.message });
  }
});

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const userId = req.query.userId; // Optional: current user ID to check ownership
    const [posts] = await db.execute(`
      SELECT p.*, u.name as poster_name, u.discipline, u.year
      FROM posts p
      JOIN users u ON p.poster_id = u.id
      ORDER BY p.created_at DESC
    `);

    // Add 'yours' flag if userId is provided and parse JSON fields
    const postsWithOwnership = posts.map((post) => {
      const parsed = parseJsonFields(post);
      return {
        ...parsed,
        yours: userId ? post.poster_id === parseInt(userId) : false,
      };
    });

    res.json(postsWithOwnership);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Get Post
app.get("/posts/:id", async (req, res) => {
  try {
    const userId = req.query.userId; // Optional: current user ID to check ownership
    const [posts] = await db.execute(
      `SELECT p.*, u.name as poster_name, u.discipline, u.year
      FROM posts p JOIN users u ON p.poster_id = u.id
      WHERE p.id = ?`,
      [req.params.id],
    );
    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = parseJsonFields(posts[0]);
    post.yours = userId ? posts[0].poster_id === parseInt(userId) : false;
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Application
app.post("/applications", async (req, res) => {
  const { post_id, applicant_id } = req.body;
  await db.execute(
    `INSERT INTO applications (post_id, applicant_id) VALUES (?, ?)`,
    [post_id, applicant_id],
  );
  res.json({ message: "Request sent!" });
});

// Get all applications for a post
app.get("/applications/:post_id", async (req, res) => {
  const [applications] = await db.execute(
    `
    SELECT r.*, u.name, u.discipline, u.year, u.skills, u.github
    FROM applications r
    JOIN users u ON r.applicant_id = u.id
    WHERE r.post_id = ?
  `,
    [req.params.post_id],
  );
  res.json(applications);
});

// Get all applications by a user
app.get("/applications/user/:user_id", async (req, res) => {
  const [applications] = await db.execute(
    `
    SELECT r.*, p.title as post_title, p.description as post_description
    FROM applications r
    JOIN posts p ON r.post_id = p.id
    WHERE r.applicant_id = ?
  `,
    [req.params.user_id],
  );
  res.json(applications);
});

// Decision on applicants
app.patch("/applications/:id", async (req, res) => {
  const { status } = req.body;
  await db.execute("UPDATE applications SET status = ? WHERE id = ?", [
    status,
    req.params.id,
  ]);
  res.json({ message: `Request ${status}!` });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
