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

// Helper function to parse JSON (handles arrays, strings, and comma-separated strings)
const parseJSON = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val; // Already an array, just return it
  try {
    return JSON.parse(val);
  } catch {
    // If JSON.parse fails, try splitting by comma
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
};

// ── Jaccard Similarity Score ────────────────────────────────────────────────
// Calculates similarity between two skill sets using Jaccard coefficient
function jaccardScore(userSkills, postSkills) {
  const a = new Set(userSkills);
  const b = new Set(postSkills);
  if (a.size === 0 && b.size === 0) return 0;
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return Math.round((intersection / union) * 100);
}

// ── Calculate Compatibility Score ──────────────────────────────────────────
// For WORK mode: only uses skills
// For PLAY mode: only uses interests
function calculateCompatibilityScore(
  userSkills,
  userInterests,
  postSkills,
  mode = "WORK",
) {
  if (mode === "WORK") {
    // WORK mode: only consider skills
    return jaccardScore(userSkills, postSkills);
  } else {
    // PLAY mode: only consider interests
    return jaccardScore(userInterests, postSkills);
  }
}

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
      terms,
      built,
      commitment,
      github,
    } = req.body;

    // Note: 'built' field is not in the database schema, so we skip it
    // If you want to store 'built', add it to the database schema first
    let updateQuery = `UPDATE users SET name = ?, email = ?, discipline = ?, year = ?, skills = ?, interests = ?, terms = ?, commitment = ?, github = ?`;
    let params = [
      name,
      email,
      discipline,
      year,
      JSON.stringify(skills || []),
      JSON.stringify(interests || []),
      JSON.stringify(terms || []),
      commitment,
      github || "",
      req.params.id,
    ];

    // If password is provided, hash it and update
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `UPDATE users SET name = ?, email = ?, password = ?, discipline = ?, year = ?, skills = ?, interests = ?, terms = ?, commitment = ?, github = ?`;
      params = [
        name,
        email,
        hashedPassword,
        discipline,
        year,
        JSON.stringify(skills || []),
        JSON.stringify(interests || []),
        JSON.stringify(terms || []),
        commitment,
        github || "",
        req.params.id,
      ];
    }

    updateQuery += ` WHERE id = ?`;
    await db.execute(updateQuery, params);

    // Fetch updated user with all fields
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

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
    const userId = req.query.userId; // Optional: current user ID to check ownership and calculate compatibility
    const mode = req.query.mode || "WORK"; // WORK or PLAY mode

    // If userId is provided, fetch user data for compatibility calculation
    let userSkills = [];
    let userInterests = [];
    if (userId) {
      try {
        const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
          userId,
        ]);
        if (users.length > 0) {
          const user = parseJsonFields(users[0]);
          userSkills = parseJSON(user.skills || []);
          userInterests = parseJSON(user.interests || []);
        }
      } catch (err) {
        console.error("Error fetching user for compatibility:", err);
      }
    }

    const [posts] = await db.execute(`
      SELECT p.*, u.name as poster_name, u.discipline, u.year
      FROM posts p
      JOIN users u ON p.poster_id = u.id
      ORDER BY p.created_at DESC
    `);

    // Add 'yours' flag and compatibility score if userId is provided
    const postsWithOwnership = posts.map((post) => {
      const parsed = parseJsonFields(post);
      const isYours = userId ? post.poster_id === parseInt(userId) : false;

      // Calculate compatibility score if userId is provided and it's not the user's own post
      let compatibilityScore = null;
      if (userId && !isYours) {
        const postSkills = parseJSON(parsed.skills_needed || []);
        if (mode === "WORK" && userSkills.length > 0) {
          compatibilityScore = calculateCompatibilityScore(
            userSkills,
            userInterests,
            postSkills,
            "WORK",
          );
        } else if (mode === "PLAY" && userInterests.length > 0) {
          compatibilityScore = calculateCompatibilityScore(
            userSkills,
            userInterests,
            postSkills,
            "PLAY",
          );
        }
      }

      return {
        ...parsed,
        yours: isYours,
        compatibility_score: compatibilityScore,
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
    const userId = req.query.userId; // Optional: current user ID to check ownership and calculate compatibility
    const mode = req.query.mode || "WORK"; // WORK or PLAY mode

    // If userId is provided, fetch user data for compatibility calculation
    let userSkills = [];
    let userInterests = [];
    if (userId) {
      try {
        const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
          userId,
        ]);
        if (users.length > 0) {
          const user = parseJsonFields(users[0]);
          userSkills = parseJSON(user.skills || []);
          userInterests = parseJSON(user.interests || []);
        }
      } catch (err) {
        console.error("Error fetching user for compatibility:", err);
      }
    }

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
    const isYours = userId ? posts[0].poster_id === parseInt(userId) : false;

    // Calculate compatibility score if userId is provided and it's not the user's own post
    let compatibilityScore = null;
    if (userId && !isYours) {
      const postSkills = parseJSON(post.skills_needed || []);
      if (mode === "WORK" && userSkills.length > 0) {
        compatibilityScore = calculateCompatibilityScore(
          userSkills,
          userInterests,
          postSkills,
          "WORK",
        );
      } else if (mode === "PLAY" && userInterests.length > 0) {
        compatibilityScore = calculateCompatibilityScore(
          userSkills,
          userInterests,
          postSkills,
          "PLAY",
        );
      }
    }

    post.yours = isYours;
    post.compatibility_score = compatibilityScore;
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
  try {
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
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Get ranked applicants for a post (by skill fit)
app.get("/applications/:post_id/ranked", async (req, res) => {
  try {
    const [posts] = await db.execute("SELECT * FROM posts WHERE id = ?", [
      req.params.post_id,
    ]);
    if (!posts.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    const [applications] = await db.execute(
      `
      SELECT r.*, u.name, u.discipline, u.year, u.skills, u.github
      FROM applications r
      JOIN users u ON r.applicant_id = u.id
      WHERE r.post_id = ?
    `,
      [req.params.post_id],
    );

    const post = parseJsonFields(posts[0]);
    const postSkills = parseJSON(post.skills_needed || []);

    // Rank applicants by skill fit
    const ranked = applications
      .map((applicant) => {
        const applicantData = parseJsonFields(applicant);
        const applicantSkills = parseJSON(applicantData.skills || []);
        const fitScore = jaccardScore(applicantSkills, postSkills);
        return { ...applicantData, fit_score: fitScore };
      })
      .sort((a, b) => b.fit_score - a.fit_score);

    res.json({ post: post.title, applicants: ranked });
  } catch (error) {
    console.error("Error ranking applicants:", error);
    res.status(500).json({ error: "Failed to rank applicants" });
  }
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

// Feed endpoint: Get posts sorted by compatibility score for a user
app.get("/feed/:user_id", async (req, res) => {
  try {
    const mode = req.query.mode || "WORK"; // WORK or PLAY mode

    // Fetch the logged in user
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.params.user_id,
    ]);
    if (!users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = parseJsonFields(users[0]);
    const userSkills = parseJSON(user.skills || []);
    const userInterests = parseJSON(user.interests || []);

    // Fetch all posts (excluding the user's own)
    const [posts] = await db.execute(
      `
      SELECT p.*, u.name as poster_name, u.discipline, u.year
      FROM posts p
      JOIN users u ON p.poster_id = u.id
      WHERE p.poster_id != ?
      ORDER BY p.created_at DESC
    `,
      [req.params.user_id],
    );

    // Score each post based on mode
    const scored = posts.map((post) => {
      const parsed = parseJsonFields(post);
      const postSkills = parseJSON(parsed.skills_needed || []);
      const finalScore = calculateCompatibilityScore(
        userSkills,
        userInterests,
        postSkills,
        mode,
      );
      return { ...parsed, compatibility_score: finalScore };
    });

    // Sort highest score first
    scored.sort((a, b) => b.compatibility_score - a.compatibility_score);

    res.json({ user: user.name, listings: scored });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
