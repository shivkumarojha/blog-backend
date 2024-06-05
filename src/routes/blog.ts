import { Hono } from "hono";
import { verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
// intiating a blog router
export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>()

// Middleware for blog router
blogRouter.use('/*', async (c, next) => {
    const authHeader = c.req.header("authorization") || ''
    const token = authHeader.split(" ")[1]
    const user = await verify(token, c.env.JWT_SECRET)
    if (user.id) {
        c.set("jwtPayload", user.id)

        await next()
    } else {
        c.status(403)
        return c.json({
            message: "Unauthorized"
        })
    }
})


// add a blog
blogRouter.post('/', async (c) => {
    const payload = c.get("jwtPayload")
    const body = await c.req.json()
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    const blog = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            published: body.published,
            authorId: payload
        }
    })

    console.log(blog)
    c.status(200)
    return c.json({
        message: "Post created Successfully",
        blog: blog
    })
})

// update blog
blogRouter.put("/", async (c) => {
    const body = await c.req.json()
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    // update title and body
    const updatedBlog = await prisma.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content
        }
    })
    if (!updatedBlog) {
        return c.json({
            message: "invalid post id"
        })
    }
    return c.json({
        message: "Post updated Successfully",
        blog: updatedBlog
    })
})


// get blog using id
blogRouter.get('/:id', async (c) => {
    const blogId = c.req.param('id')
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    // Find the specific blog
    const blog = await prisma.post.findUnique({
        where: {
            id: blogId
        }
    })

    if (!blog) {
        c.status(404)
        return c.json({
            message: "Not found"
        })
    }

    return c.json({
        message: "Blog fetched Successfully",
        blog: blog
    })
})
// get all the blogs: TODO - add pagination
blogRouter.get('/post/bulk', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const blogs = await prisma.post.findMany()
        return c.json({
            message: "Successfully fetched blogs",
            blogs: blogs

        })
    } catch (error) {
        return c.json({
            message: "Some error occured",
            error: error
        })
    }
})
