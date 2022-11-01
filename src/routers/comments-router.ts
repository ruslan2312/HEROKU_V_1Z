import {Request, Response, Router} from "express";
import {commentsService} from "../service/comments-service";
import {authTokenMW} from "../middleware/authorization-middleware";
import {CommentsResponseType} from "../types/commentsType";
import {commentsContentValidation} from "../common/validator";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";

export const commentsRouter = Router()

commentsRouter.get('/:commentId', async (req: Request, res: Response) => {
    const comment: CommentsResponseType | null = await commentsService.findCommentsByID(req.params.commentId)
    if (comment) {
        res.status(200).send(comment)
    } else {
        res.send(404)
    }
})
commentsRouter.put('/:commentId', authTokenMW, commentsContentValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    const commentId = req.params.commentId
    const userId = req!.user!.id
    const content = req.body.content
    const comment = await commentsService.findCommentsByID(commentId)
    if (!comment) return res.sendStatus(404)
    if (comment.userId !== userId) return res.sendStatus(403)
    await commentsService.updateComment(commentId, content, userId)
    return res.sendStatus(204)
})
commentsRouter.delete('/:commentId', authTokenMW, async (req: Request, res: Response) => {
    const userId = req!.user!.id
    const commentId = req.params.commentId
    const comment = await commentsService.findCommentsByID(commentId)
    if (!comment) return res.sendStatus(404)
    if (comment.userId !== userId) return res.sendStatus(403)
    await commentsService.deleteComment(commentId)
    return res.sendStatus(204)
})

