import {body} from "express-validator";
import {usersRepository} from "../repository/users-repository";
//Posts
export const titleValidation = body('title').trim().isLength({min: 1, max: 30})
export const shortDescriptionValidation = body('shortDescription').trim().isLength({min: 1, max: 100})
export const contentValidation = body('content').trim().isLength({min: 1, max: 1000})
export const blogIdValidation = body('blogId').isString().isLength({min: 1, max: 30})
export const blogNameValidation = body('blogName').trim().isLength({min: 1, max: 30}).optional()

// Blogs
export const nameValidation = body('name').trim().isLength({min: 1, max: 15})
export const websiteUrlValidation = body('websiteUrl').isLength({min: 1, max: 100})

// Users
export const usersLoginValidation = body('login').isString().trim().isLength({min: 3, max: 10}).custom(async login => {
    const user = await usersRepository.findByLoginOrEmail(login)
    if (user) throw new Error()
    return true
})
export const usersPasswordValidation = body('password').isString().trim().isLength({min: 6, max: 20})
export const usersEmailValidation = body('email').isEmail().trim().isLength({min: 5, max: 30}).custom(async email => {
    const user = await usersRepository.findByLoginOrEmail(email)
    if (user) throw new Error()
    return true
})
export const usersEmailValidationResending = body('email').isEmail().trim().isLength({
    min: 5,
    max: 30
}).custom(async email => {
    const user = await usersRepository.findByLoginOrEmail(email)
    if (user?.emailConfirmation.isConfirmed === true) throw new Error()
    if (!user) throw new Error()
    return true
})
// Comments
export const commentsContentValidation = body('content').trim().isLength({min: 20, max: 300})

// Auth
export const authLoginValidation =  body('loginOrEmail').isString().trim().isLength({min: 3, max: 30})
export const authPasswordValidation = body('password').isString().trim().isLength({min: 6, max: 20})
export const authRegistrationConfirm = body('code').isString().trim().isLength({
    min: 5,
    max: 150
}).custom(async code => {
    const user = await usersRepository.findUserByCode(code)
    if (user === null) throw new Error
    if (user?.emailConfirmation.confirmationCode !== code) throw new Error
    if (user?.emailConfirmation.isConfirmed === true) throw new Error
    return true
})
export const authLogoutValidation = body('logout').custom(async code => {
    const user = await usersRepository.findUserByCode(code)
    if (user === null) throw new Error
    if (user?.emailConfirmation.confirmationCode !== code) throw new Error
    if (user?.emailConfirmation.isConfirmed === true) throw new Error
    return true
})
