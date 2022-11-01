import {UserType} from "../common/type";
declare global {
    namespace Express {
        export interface Request {
            user: UserType | null
        }
    }
}