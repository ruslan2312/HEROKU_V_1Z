import {Request, Response, Router} from "express";
import {emailAdapter} from "../adapter/email-adapter";

export const emailRouter = Router({})


emailRouter.post('/send', async (req: Request, res: Response) => {
    const info = await emailAdapter.sendMail(req.body.email, req.body.subject, req.body.message)
    if(info) res.send("Message send").status(204)
    else res.sendStatus(400)
})