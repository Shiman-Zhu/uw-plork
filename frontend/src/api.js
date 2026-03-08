// API LAYER - Connected to backend API at http://localhost:3000

const API_BASE = "http://localhost:3000";

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

export const api = {
  // ── AUTH ──────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Login failed" }));
        throw new Error(errorData.error || "Invalid email or password");
      }
      const data = await response.json();
      return { userId: data.userId, user: parseJsonFields(data.user) };
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  register: async (formData) => {
    try {
      if (!formData.password) {
        throw new Error("Password is required");
      }
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          discipline: formData.discipline,
          year: formData.year,
          skills: formData.skills || [],
          interests: formData.interests || [],
          commitment: formData.commitment,
          github: formData.github || "",
        }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Registration failed" }));
        throw new Error(errorData.error || "Registration failed");
      }
      const result = await response.json();
      // Get the created user to return ID
      const usersRes = await fetch(`${API_BASE}/users`);
      if (!usersRes.ok) throw new Error("Failed to fetch created user");
      const users = await usersRes.json();
      const user = users.find((u) => u.email === formData.email);
      if (!user) throw new Error("User not found after creation");
      return { userId: user.id, user: parseJsonFields(user) };
    } catch (error) {
      console.error("Error registering:", error);
      throw error;
    }
  },

  // ── PROFILE ───────────────────────────────────────────────────────────────
  getProfile: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      const user = await response.json();
      return parseJsonFields(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  updateProfile: async (userId, data) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          discipline: data.discipline,
          year: data.year,
          skills: data.skills || [],
          interests: data.interests || [],
          commitment: data.commitment,
          github: data.github || "",
        }),
      });
      if (!response.ok) throw new Error("Update failed");
      const updated = await response.json();
      return parseJsonFields(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // ── PROJECTS / ACTIVITIES ─────────────────────────────────────────────────
  getProjects: async (mode, userId = null) => {
    try {
      const url = userId
        ? `${API_BASE}/posts?userId=${userId}`
        : `${API_BASE}/posts`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const posts = await response.json();
      return posts.map((post) => {
        const parsed = parseJsonFields(post);
        // Transform skills_needed array into roles structure
        const skillsNeeded = parsed.skills_needed || [];
        const roles =
          skillsNeeded.length > 0
            ? skillsNeeded.map((skill, idx) => ({
                title: `Role ${idx + 1}`,
                skills: Array.isArray(skill) ? skill : [skill],
                filled: false,
              }))
            : [];

        return {
          id: parsed.id,
          name: parsed.title,
          tagline: parsed.description || "",
          category: "SOFTWARE", // Default, could be stored in DB
          stage: "IDEA", // Default
          match:
            parsed.compatibility_score !== null &&
            parsed.compatibility_score !== undefined
              ? parsed.compatibility_score
              : parsed.yours
                ? 100
                : 0, // Use real compatibility score, or 100 for own posts, 0 for others
          commitment: parsed.commitment || "SERIOUS",
          roles: roles,
          spots: parsed.spots || 1,
          terms: { founder: [], overlap: [] },
          yours: parsed.yours || false,
          poster_name: parsed.poster_name,
          discipline: parsed.discipline,
          year: parsed.year,
        };
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  },

  createProject: async (data, userId) => {
    try {
      if (!userId) throw new Error("User ID required");

      // Transform roles into skills_needed array
      const skillsNeeded = data.roles
        ? data.roles.map((r) => r.skills || []).flat()
        : [];

      const response = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poster_id: userId,
          title: data.name,
          description: data.tagline || "",
          skills_needed: skillsNeeded,
          commitment: data.commitment || null,
          spots: data.spots || 1,
          deadline: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to create post" }));
        throw new Error(
          errorData.error ||
            `Failed to create post: ${response.status} ${response.statusText}`,
        );
      }

      const created = parseJsonFields(await response.json());

      // Transform back to frontend format
      return {
        id: created.id,
        name: created.title,
        tagline: created.description || "",
        category: data.category || "SOFTWARE",
        stage: data.stage || "IDEA",
        match: Math.floor(Math.random() * 20) + 70,
        commitment: created.commitment || data.commitment || "SERIOUS",
        roles:
          data.roles ||
          (created.skills_needed && created.skills_needed.length > 0
            ? created.skills_needed.map((skill, idx) => ({
                title: `Role ${idx + 1}`,
                skills: Array.isArray(skill) ? skill : [skill],
                filled: false,
              }))
            : []),
        spots: created.spots || data.spots || 1,
        terms: data.terms || { founder: [], overlap: [] },
        yours: true,
        poster_name: created.poster_name,
        discipline: created.discipline,
        year: created.year,
      };
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  // ── APPLICATIONS ──────────────────────────────────────────────────────────
  submitApplication: async (postId, userId) => {
    try {
      const response = await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          applicant_id: userId,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit application");
      return await response.json();
    } catch (error) {
      console.error("Error submitting application:", error);
      throw error;
    }
  },

  getMyApplications: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/applications/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch applications");
      return await response.json();
    } catch (error) {
      console.error("Error fetching applications:", error);
      return [];
    }
  },
};
