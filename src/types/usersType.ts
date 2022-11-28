import mongoose from "mongoose";

export type UsersPaginationQueryType = {
    searchLoginTerm: string,
    searchEmailTerm: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc";
}
export type UserType = {
    id: string,
    login: string,
    email: string,
    createdAt: string,
    passwordHash: string,
}

export type UserDbType = {
    id: string
    accountData: {
        login: string,
        email: string,
        passwordHash: string,
        createdAt: string,
    },
    emailConfirmation: {
        confirmationCode: any,
        expirationData: Date,
        recoveryCode: any,
        isConfirmed: boolean,
    }
}
export type UserResponseType = {
    id: string,
    login: string,
    email: string,
    createdAt: string,
}

export const newUsersScheme = new mongoose.Schema({
    id: String,
    accountData: {
        login: String,
        email: String,
        passwordHash: String,
        createdAt: String,
    },
    emailConfirmation: {
        confirmationCode: String,
        expirationData: Date,
        recoveryCode: String,
        isConfirmed: Boolean,
    }
})