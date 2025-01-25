import * as dotenv from 'dotenv'

dotenv.config()

export const CONFIG = {
    API_URL: process.env.FACE_API_URL,
    API_SUBSCRIPTION_KEY: process.env.FACE_API_SUBSCRIPTION_KEY || '',
    UPLOADS_PATH: process.env.UPLOADS_ABSOLUTE_PATH || '../uploads',
    ORIGIN: process.env.ORIGIN || '*',
    PORT: process.env.PORT || 3000,
}
