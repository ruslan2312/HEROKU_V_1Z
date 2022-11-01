import {Request, Response, Router} from "express";
import {usersService} from "../service/users-service";
import {
    usersEmailValidation,
    usersLoginValidation,
    usersPasswordValidation
} from "../common/validator";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";
import {UsersPaginationData} from "../common/blogPaginationData";
import {mwBasicAuth} from "../middleware/MwBasic";

export const usersRouter = Router()

usersRouter.get('/', async (req: Request, res: Response) => {
    const queryData = UsersPaginationData(req.query)
    const findUser = await usersService.findUsers(queryData)
    res.status(200).send(findUser)
})
usersRouter.post('/', mwBasicAuth, usersLoginValidation, usersPasswordValidation,usersEmailValidation,  inputValidationMiddleware, async (req: Request, res: Response) => {
    const newUser = await usersService.createUser(req.body.login, req.body.email, req.body.password)
    if (newUser) {
        res.status(201).send(newUser)
    } else {
        res.sendStatus(400)
    }
})
usersRouter.delete('/:id', mwBasicAuth, inputValidationMiddleware, async (req: Request, res: Response) => {
    const deleteUsers = await usersService.deleteUser(req.params.id)
    if (deleteUsers) {
        res.send(204)
    } else {
        res.send(404)
    }
})
