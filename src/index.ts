import * as dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser";
import {runDb} from "./repository/db";
import {blogsRouter} from "./routers/blogs-router";
import {postsRouter} from "./routers/posts-router";
import {allDelete} from "./routers/all-delete";
import {usersRouter} from "./routers/users-router";
import {authRouter} from "./routers/auth-router";
import {commentsRouter} from "./routers/comments-router";
import {emailRouter} from "./routers/email.route";

dotenv.config()

export const app = express();
const port = process.env.PORT || 3000
app.use(cookieParser())
app.use(express.json())
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use("/comments", commentsRouter)
app.use('/email', emailRouter)
app.use('/testing/all-data', allDelete)
const startApp = async () => {
    await runDb()
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}
startApp()