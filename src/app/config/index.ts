import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,


    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET,
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET
    },

    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },

    nodeMiller: {
        email_host: process.env.EMAIL_HOST,
        email_port: process.env.EMAIL_PORT,
        email_user: process.env.EMAIL_USER,
        email_pass: process.env.EMAIL_PASS,
        email_from: process.env.EMAIL_FROM,
    },

    stripe: {
        stripeSecretKey: process.env.STRIPE_SECRET_KEY,
        stripeWebHookSecret: process.env.STRIPE_WEBHOOKS_SECRET,
        frontendUrl: process.env.FRONTEND_URL
    },

    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },



    // Google OAuth (NEW)
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/users/auth/google/callback',
    },

    // Session Secret (NEW)
    session: {
        secret: process.env.SESSION_SECRET || 'fallback-secret-change-this-in-production',
    },

    // admin
    admin: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
    },

    bcrypt: {
        saltRounds: process.env.BCRYPT_SALT || 10,
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY
    }   

    frontend_url: process.env.FRONTEND_URL


}
