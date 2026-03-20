import dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: getEnv('CLIENT_URL', 'http://localhost:3000'),
  jwtAccessSecret: getEnv('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET'),
  accessTokenExpiresIn: getEnv('ACCESS_TOKEN_EXPIRES_IN', '15m'),
  refreshTokenExpiresIn: getEnv('REFRESH_TOKEN_EXPIRES_IN', '7d')
};
