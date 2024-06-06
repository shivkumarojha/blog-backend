import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from 'hono/jwt'
import { signInInput, SignInInputType, signUpInput, SignUpInputType } from "@shivkumarojha/medium-common1.0";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>()
// POST / api / v1 / user / signup
userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const body = await c.req.json()
        const parsedData = signUpInput.safeParse(body)
        if (!parsedData.success) {
            return c.json({
                message: "Invalid sign up input",
                error: parsedData.error
            })
        }
        const user = parsedData.data
        await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
                password: user.password
            }
        })
        console.log("hello", user)
        return c.json({
            message: "User Created Successfully",
            user: user
        })
    } catch (error) {
        c.status(403)
        c.json({
            message: "Some error occured while creating user",
            error: error
        })
    }
})

// POST / api / v1 / user / signin
userRouter.post('/signin', async (c) => {
    const body = await c.req.json()

    const parsedData = signInInput.safeParse(body)
    if (!parsedData.success) {
        return c.json({
            message: "Invalid sign up input",
            error: parsedData.error
        })
    }
    const { email, password } = parsedData.data
    // initializing prisma
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {

        const isUser = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                password: true
            }
        })
        if (!isUser) {
            c.json({
                message: "email doesn't exist, Kindly sign up"
            })
        }
        if (password !== isUser?.password) {
            c.json({
                message: "Password didn't matched"
            })
        }
        const token = await sign({ id: isUser?.id, email: email }, c.env.JWT_SECRET)
        c.status(200)
        return c.json({
            message: "Successfully logged in",
            token: token
        })
    } catch (error) {
        c.json({
            message: "Something bad happend",
            error: error
        })
    }

})
