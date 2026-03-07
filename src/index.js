import express from 'express'
import db from './db.js'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())


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