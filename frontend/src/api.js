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
      return { token: "mock-jwt", userId: data.userId, user: data.user };
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
      await response.json();
      // Get the created user to return ID
      const usersRes = await fetch(`${API_BASE}/users`);
      if (!usersRes.ok) throw new Error("Failed to fetch created user");
      const users = await usersRes.json();
      const user = users.find((u) => u.email === formData.email);
      if (!user) throw new Error("User not found after creation");
      return { token: "mock-jwt", userId: user.id, ...parseJsonFields(user) };
    } catch (error) {
      console.error("Error registering:", error);
      if (
        error.message.includes("Failed to fetch") ||
        error.name === "TypeError"
      ) {
        throw new Error(
          "Cannot connect to server. Make sure the backend is running on http://localhost:3000",
        );
      }
      throw error;
    }
  },

  logout: () => Promise.resolve({ ok: true }),

  // ── PROFILE ───────────────────────────────────────────────────────────────
  getProfile: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`);
      if (!response.ok) {
        const usersRes = await fetch(`${API_BASE}/users`);
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const users = await usersRes.json();
        const user = users.find((u) => u.id === Number(userId)) || users[0];
        return parseJsonFields(user);
      }
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
        return {
          id: parsed.id,
          name: parsed.title,
          tagline: parsed.description || "",
          category: "SOFTWARE",
          stage: "IDEA",
          match: Math.floor(Math.random() * 20) + 70,
          commitment: parsed.commitment || "SERIOUS",
          roles: parsed.skills_needed
            ? parsed.skills_needed.map((skill, idx) => ({
                title: `Role ${idx + 1}`,
                skills: Array.isArray(skill) ? skill : [skill],
                filled: false,
              }))
            : [],
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
      const response = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poster_id: userId,
          title: data.name,
          description: data.tagline,
          skills_needed: data.roles
            ? data.roles.map((r) => r.skills).flat()
            : [],
          commitment: data.commitment,
          spots: data.spots || 1,
          deadline: null,
        }),
      });
      if (!response.ok) throw new Error("Failed to create post");
      await response.json();
      const postsRes = await fetch(`${API_BASE}/posts`);
      if (postsRes.ok) {
        const posts = await postsRes.json();
        const created = posts[0];
        return { ...data, id: created.id };
      }
      return { ...data, id: Date.now() };
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  updateProject: async (id, data) => {
    return { id, ...data };
  },

  deleteProject: async (id) => {
    return { ok: true };
  },

  // ── OUTBOUND APPLICATIONS ──────────────────────────────────────────────────
  getMyApplications: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/applications/user/${userId}`);
      if (!response.ok) {
        const postsRes = await fetch(`${API_BASE}/posts`);
        if (!postsRes.ok) throw new Error("Failed to fetch posts");
        const posts = await postsRes.json();
        const applications = [];
        for (const post of posts) {
          const appRes = await fetch(`${API_BASE}/applications/${post.id}`);
          if (appRes.ok) {
            const apps = await appRes.json();
            const userApp = apps.find((a) => a.applicant_id === Number(userId));
            if (userApp) {
              const parsed = parseJsonFields(userApp);
              applications.push({
                id: parsed.id,
                projectId: post.id,
                projectName: post.title || post.post_title,
                projectCategory: "SOFTWARE",
                roleTitle: "Role",
                roleSkills: [],
                intro: "",
                links: parsed.github || "",
                status: parsed.status || "PENDING",
                createdAt: parsed.applied_at || new Date().toISOString(),
                updatedAt: parsed.applied_at || new Date().toISOString(),
              });
            }
          }
        }
        return applications;
      }
      const applications = await response.json();
      return applications.map((app) => {
        const parsed = parseJsonFields(app);
        return {
          id: parsed.id,
          projectId: parsed.post_id,
          projectName: parsed.post_title || "",
          projectCategory: "SOFTWARE",
          roleTitle: "Role",
          roleSkills: [],
          intro: "",
          links: "",
          status: parsed.status || "PENDING",
          createdAt: parsed.applied_at || new Date().toISOString(),
          updatedAt: parsed.applied_at || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      return [];
    }
  },

  submitApplication: async (data, userId) => {
    try {
      if (!userId) throw new Error("User ID required");
      const response = await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: data.projectId,
          applicant_id: userId,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit application");
      await response.json();
      return {
        id: `app_${Date.now()}`,
        ...data,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error submitting application:", error);
      throw error;
    }
  },

  // ── INBOUND APPLICATIONS ───────────────────────────────────────────────────
  getProjectApplicants: async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/applications/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch applicants");
      const applications = await response.json();
      return applications.map((app) => {
        const parsed = parseJsonFields(app);
        return {
          id: parsed.id,
          applicantName: parsed.name,
          applicantStream: `${parsed.discipline} ${parsed.year}`,
          applicantSkills: parsed.skills || [],
          applicantTerms: [],
          applicantMatch: Math.floor(Math.random() * 20) + 70,
          roleTitle: "Role",
          intro: "",
          links: parsed.github || "",
          status: parsed.status || "PENDING",
          createdAt: parsed.applied_at || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Error fetching applicants:", error);
      return [];
    }
  },

  updateApplicationStatus: async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update application");
      return { status };
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  },

  // ── MATCHING ──────────────────────────────────────────────────────────────
  getCompatibleUsers: async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const users = await response.json();
      return users.slice(0, 3).map((u) => {
        const parsed = parseJsonFields(u);
        return {
          id: parsed.id,
          name: parsed.name,
          stream: `${parsed.discipline} ${parsed.year}`,
          match: Math.floor(Math.random() * 20) + 70,
          skills: parsed.skills || [],
          terms: [],
        };
      });
    } catch (error) {
      console.error("Error fetching compatible users:", error);
      return [];
    }
  },

  // ── INVITES ───────────────────────────────────────────────────────────────
  sendInvite: async (toUserId, projectId, roleTitle) => {
    try {
      const response = await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: projectId,
          applicant_id: toUserId,
        }),
      });
      if (!response.ok) throw new Error("Failed to send invite");
      return { ok: true };
    } catch (error) {
      console.error("Error sending invite:", error);
      throw error;
    }
  },
};
