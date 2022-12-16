import {Request, Response, Router} from "express";
import {postsService} from "../service/posts-service";
import {blogsService} from "../service/blogs-service";
import {usersService} from "../service/users-service";
import {commentsService} from "../service/comments-service";
import {deviceService} from "../service/device-service";
import {requestDbRepo} from "../repository/requestDbRepo";
import {commentsRepository} from "../repository/comments-repository";

export const allDelete = Router();

allDelete.delete('/', async (req: Request, res: Response) => {
    await blogsService.deleteAllBlogger()
    await postsService.deleteAllPosts()
    await usersService.deleteAllUsers()
    await commentsService.deleteAllComments()
    await deviceService.deleteAllDevice()
    await requestDbRepo.deleteAllRequest()
    await commentsRepository.deleteAllLike()
    res.sendStatus(204)
})