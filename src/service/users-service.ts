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
            }
        } else return null

    },
    async findUserByLoginOrEmail(loginOrEmail: string): Promise<any> {
        return usersRepository.findByLoginOrEmail(loginOrEmail)
    },
    async createUser(login: string, email: string, password: string): Promise<UserResponseType> {
        const passwordHash = await this._generateHash(password)
        const newUser: UserDbType = {
            id: new Date().valueOf().toString(),
            accountData: {
                login: login,
                email: email,
                passwordHash,
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
        const user = await usersRepository.findByLoginOrEmail(loginOrEmail)
        console.log(user)
        if (!user) return false
        const passwordHash = await this._compareHash(password, user.accountData.passwordHash)
        if (passwordHash) {
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
    async getTokenPayload(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_REFRESH_SECRET)
            return result
        } catch (error) {
            return null
        }
    },
    _generateHash(password: string) {
        return bcrypt.hash(password, 10)
    },
    transformDbTypeToResponseTypeForFindUsers(findUsers: UserType) {
        return {
            id: findUsers.id,
            login: findUsers.login,
            email: findUsers.email,
            createdAt: findUsers.createdAt
        }
    },
    _compareHash(password: string, hash: string) {
        return bcrypt.compare(password, hash)
    }
}