import {Request, Response, Router} from "express";
import {postsService} from "../service/posts-service";
import {blogsService} from "../service/blogs-service";
import {usersService} from "../service/users-service";
import {commentsService} from "../service/comments-service";

export const allDelete = Router();

allDelete.delete('/', async (req: Request, res: Response) => {
    await blogsService.deleteAllBlogger()
    await postsService.deleteAllPosts()
    await usersService.deleteAllUsers()
    await commentsService.deleteAllComments()
    res.sendStatus(204)
})