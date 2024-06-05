import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// POST / api / v1 / user / signup
app.post('api/v1/user/signup', (c) => {
  return c.text("From signup")
})

// POST / api / v1 / user / signin
app.post('api/v1/user/signin', (c) => {
  return c.text("From Sign in")
})

// POST / api / v1 / blog
app.post('/api/v1/blog', (c) => {
  return c.text("From blog")
})

// PUT / api / v1 / blog
app.put("/api/v1/blog", (c) => {
  return c.text("From blog")
})

// GET / api / v1 / blog /: id
app.get('/api/v1/blog/:id', (c) => {
  return c.text("From blog id")
})
// GET / api / v1 / blog / bulk
app.get('/api/v1/blog/bulk', (c) => {
  return c.text("from Blog bulk")
})


export default app
