import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';
