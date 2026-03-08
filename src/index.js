import express from 'express'
import db from './db.js'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

function parseJSON(val) {
  if (!val) return []
  if (Array.isArray(val)) return val  // ← already an array, just return it
  try {
    return JSON.parse(val)
  } catch {
    return val.split(',').map(s => s.trim()).filter(Boolean)
  }
}

// ── Jaccard (keep this for /feed) ──────────────────────────────
function jaccardScore(userSkills, postSkills) {
  const a = new Set(userSkills)
  const b = new Set(postSkills)
  if (a.size === 0 && b.size === 0) return 0
  const intersection = [...a].filter(x => b.has(x)).length
  const union = new Set([...a, ...b]).size
  return Math.round((intersection / union) * 100)
}

function rankApplicantsForPost(post, applicants) {
  const postSkills = parseJSON(post.skills_needed)  // ← change this
  const scored = applicants.map(applicant => {
    const applicantSkills = parseJSON(applicant.skills)  // ← and this
    const score = jaccardScore(applicantSkills, postSkills)
    return { ...applicant, fit_score: score }
  })
  return scored.sort((a, b) => b.fit_score - a.fit_score)
}

// ── New route: GET /applications/:post_id/ranked ───────────────
// Returns applicants for a post, ranked by skill fit
app.get('/applications/:post_id/ranked', async (req, res) => {
  const [posts] = await db.execute(
    'SELECT * FROM posts WHERE id = ?',
    [req.params.post_id]
  )
  if (!posts.length) return res.status(404).json({ error: 'Post not found' })

  const [applications] = await db.execute(`
    SELECT r.*, u.name, u.discipline, u.year, u.skills, u.github
    FROM applications r
    JOIN users u ON r.applicant_id = u.id
    WHERE r.post_id = ?
  `, [req.params.post_id])

  const ranked = rankApplicantsForPost(posts[0], applications)
  res.json({ post: posts[0].title, applicants: ranked })
})


app.get('/', (req, res) => {
  res.json({ message: 'uw-plork API is running!' })
})


/** USERS!!!*/

// Create user
app.post('/users', async (req, res) => {
  const { name, email, discipline, year, skills, interests, commitment, github } = req.body
  await db.execute(
    `INSERT INTO users (name, email, discipline, year, skills, interests, commitment, github)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, discipline, year,
    JSON.stringify(skills),
    JSON.stringify(interests),
    commitment, github]
  )
  res.json({ message: 'User created!' })
})

// Get all users
app.get('/users', async (req, res) => {
  const [users] = await db.execute('SELECT * FROM users')
  res.json(users)
})

// Get single user
app.get('/users/:id', async (req, res) => {
  const [users] = await db.execute(
    'SELECT * FROM users WHERE id = ?',
    [req.params.id]
  )
  if (!users.length) return res.status(404).json({ error: 'User not found' })
  res.json(users[0])
})


/** POST!!!!!!!!!!!!!!!!!!!!!!!! */

// Create a post
app.post('/posts', async (req, res) => {
  const { poster_id, title, description, skills_needed, commitment, spots, deadline } = req.body
  await db.execute(
    `INSERT INTO posts (poster_id, title, description, skills_needed, commitment, spots, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [poster_id, title, description, JSON.stringify(skills_needed), commitment, spots, deadline]
  )
  res.json({ message: 'Post created!' })
})

// Get all posts 
app.get('/posts', async (req, res) => {
  const [posts] = await db.execute(`
    SELECT p.*, u.name as poster_name, u.discipline, u.year
    FROM posts p
    JOIN users u ON p.poster_id = u.id
    ORDER BY p.created_at DESC
  `)
  res.json(posts)
})

// Get Post
app.get('/posts/:id', async (req, res) => {
  const [posts] = await db.execute(
    `SELECT p.*, u.name as poster_name, u.discipline, u.year
    FROM posts p JOIN users u ON p.poster_id = u.id
    WHERE p.id = ?`,
    [req.params.id]
  )
  res.json(posts[0])
})

/* compatibility scores */
app.get('/feed/:user_id', async (req, res) => {
  // Fetch the logged in user
  const [users] = await db.execute(
    'SELECT * FROM users WHERE id = ?',
    [req.params.user_id]
  )
  if (!users.length) return res.status(404).json({ error: 'User not found' })

  const user = users[0]
  const userSkills    = parseJSON(user.skills)
  const userInterests = parseJSON(user.interests)

  // Fetch all posts (excluding the user's own)
  const [posts] = await db.execute(`
    SELECT p.*, u.name as poster_name, u.discipline, u.year
    FROM posts p
    JOIN users u ON p.poster_id = u.id
    WHERE p.poster_id != ?
    ORDER BY p.created_at DESC
  `, [req.params.user_id])

  // Score each post
  const scored = posts.map(post => {
    const postSkills = parseJSON(post.skills_needed)

    const skillScore    = jaccardScore(userSkills, postSkills)
    const interestScore = jaccardScore(userInterests, postSkills) // interests vs skills needed
    const finalScore    = Math.round((skillScore * 0.7) + (interestScore * 0.3))

    return { ...post, compatibility_score: finalScore }
  })

  // Sort highest score first
  scored.sort((a, b) => b.compatibility_score - a.compatibility_score)

  res.json({ user: user.name, listings: scored })
})

// Application
app.post('/applications', async (req, res) => {
  const { post_id, applicant_id} = req.body
  await db.execute(
    `INSERT INTO applications (post_id, applicant_id) VALUES (?, ?)`,
    [post_id, applicant_id]
  )
  res.json({ message: 'Request sent!' })
})

// Get all applications for a post
app.get('/applications/:post_id', async (req, res) => {
  const [applications] = await db.execute(`
    SELECT r.*, u.name, u.discipline, u.year, u.skills, u.github
    FROM applications r
    JOIN users u ON r.applicant_id = u.id
    WHERE r.post_id = ?
  `, [req.params.post_id])
  res.json(applications)
})

// Decision on applicants
app.patch('/applications/:id', async (req, res) => {
  const { status } = req.body
  await db.execute(
    'UPDATE applications SET status = ? WHERE id = ?',
    [status, req.params.id]
  )
  res.json({ message: `Request ${status}!` })
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))