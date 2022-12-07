import { likesSchema, newCommentsScheme} from "../types/commentsType";
import {newUsersScheme} from "../types/usersType"
import {newPostsScheme} from "../types/postsType"
import {newBloggersScheme} from "../types/blogsType"
import {settings} from "../settings";
import mongoose from 'mongoose'
import {newDevicesScheme} from "../types/devicesTypes";
import {newReqScheme} from "../types/type";


const mongoUri = settings.MONGO_URI


export const CommentsModel = mongoose.model('comments', newCommentsScheme)
export const LikesModel = mongoose.model('likes', likesSchema)

export const BlogsModel = mongoose.model('blogs', newBloggersScheme)
export const PostsModel = mongoose.model('posts', newPostsScheme)

export const UsersModel = mongoose.model('users', newUsersScheme)
export const DevicesModel = mongoose.model('devices', newDevicesScheme)

export const requestDbModel = mongoose.model('requestDb', newReqScheme)

export async function runDb() {
    try {
        await mongoose.connect(mongoUri);
        console.log("Connected successfully to mongo server");
    } catch {
        console.log("Can't connect to db");
        // Ensures that the client will close when you finish/error
        await mongoose.disconnect()
    }
}