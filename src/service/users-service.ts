import {UserDbType, UserResponseType, UsersPaginationQueryType, UserType} from "../types/usersType";
import bcrypt from 'bcrypt'
import {usersRepository} from "../repository/users-repository";
import add from "date-fns/add"
import {PaginationResultType} from "../helpers/paginathion";
import {randomUUID} from "crypto";
import {emailAdapter} from "../adapter/email-adapter";
import jwt from "jsonwebtoken";
import {settings} from "../settings";

export const usersService = {
    async findUsers(query: UsersPaginationQueryType): Promise<PaginationResultType> {
        return await usersRepository.findUsers(query)
    },
    async findUserById(id: string): Promise<UserType | null> {
        const findUserById = await usersRepository.findUserById(id)
        if (findUserById) {
            return {
                id: findUserById.id,
                login: findUserById.accountData.login,
                email: findUserById.accountData.email,
                createdAt: findUserById.accountData.createdAt,
                passwordHash: findUserById.accountData.createdAt,
                passwordSalt: findUserById.accountData.passwordSalt
            }
        } else return null

    },
    async findUserByLoginOrEmail(loginOrEmail: string): Promise<any> {
        return usersRepository.findByLoginOrEmail(loginOrEmail)
    },
    async createUser(login: string, email: string, password: string): Promise<UserResponseType> {
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await this._generateHash(password, passwordSalt)
        const newUser: UserDbType = {
            id: new Date().valueOf().toString(),
            accountData: {
                login: login,
                email: email,
                passwordHash,
                passwordSalt,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationData: add(new Date(), {
                    hours: 1
                }),
                isConfirmed: false
            }
        }
        await usersRepository.createUser(newUser)
        await emailAdapter.sendMail(email, "Registr", newUser.emailConfirmation.confirmationCode)
        return {
            id: newUser.id,
            login: newUser.accountData.login,
            email: newUser.accountData.email,
            createdAt: newUser.accountData.createdAt
        }
    },
    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
    },
    async deleteAllUsers(): Promise<boolean> {
        return usersRepository.deleteAllUsers()
    },
    async checkCredentials(loginOrEmail: string, password: string) {
        debugger
        const user = await usersRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return false
        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
        debugger
        if (user.accountData.passwordHash === passwordHash) {
            return user
        } else return null;
    },
    async getUserIdByAccessToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return result.id
        } catch (error) {
            return null
        }
    },
    async getUserIdByRefreshToken(token: string) {
        try {
            debugger
            const result: any = jwt.verify(token, settings.JWT_REFRESH_SECRET)
            return result.id
        } catch (error) {
            return null
        }
    },
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    },
    transformDbTypeToResponseTypeForFindUsers(findUsers: UserType) {
        return {
            id: findUsers.id,
            login: findUsers.login,
            email: findUsers.email,
            createdAt: findUsers.createdAt
        }
    },
}