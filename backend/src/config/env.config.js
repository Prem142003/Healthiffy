import dotenv from 'dotenv';

dotenv.config();

const firstDefined = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined && value !== '') return value;
  }
  return undefined;
};

const isProduction = process.env.NODE_ENV === 'production';

const required = [
  ['MONGO_URI', 'MONGODB_URI'],
  ['JWT_ACCESS_SECRET', 'JWT_SECRET'],
  ['JWT_REFRESH_SECRET', 'JWT_SECRET'],
  ['JWT_ACCESS_EXPIRES_IN'],
  ['JWT_REFRESH_EXPIRES_IN']
];

for (const keys of required) {
  if (!keys.some((key) => process.env[key])) {
    throw new Error(`Missing required environment variable: ${keys.join(' or ')}`);
  }
}

const productionRequired = [
  ['FRONTEND_URL', 'CLIENT_URL'],
  ['CORS_ORIGINS'],
  ['GOOGLE_CLIENT_ID']
];

if (isProduction) {
  for (const keys of productionRequired) {
    if (!keys.some((key) => process.env[key])) {
      throw new Error(`Missing required production environment variable: ${keys.join(' or ')}`);
    }
  }
}

const clientUrl = firstDefined('FRONTEND_URL', 'CLIENT_URL') || 'http://localhost:5173';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: firstDefined('MONGO_URI', 'MONGODB_URI'),
  mongoDbName: process.env.MONGO_DB_NAME || undefined,
  clientUrl,
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtAccessSecret: firstDefined('JWT_ACCESS_SECRET', 'JWT_SECRET'),
  jwtRefreshSecret: firstDefined('JWT_REFRESH_SECRET', 'JWT_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'hf_refresh_token',
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'healthiffy'
  },
  isProduction
};
