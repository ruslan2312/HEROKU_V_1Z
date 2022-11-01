export const settings = {
    MONGO_URI: process.env.mongoURI || "mongodb+srv://admin:hecbrhecbr1@cluster0.3r5xv3r.mongodb.net/?retryWrites=true&w=majority",
    JWT_SECRET: process.env.JWT_SECRET || "123",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "228"
}