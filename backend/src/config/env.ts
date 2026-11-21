import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current working dir or in backend/ directory
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

export const config = {
  port: parseInt((process.env.PORT || '5000').trim(), 10),
  nodeEnv: (process.env.NODE_ENV || 'development').trim(),
  
  // Nexconn Credentials
  nexconn: {
    appKey: (process.env.NEXCONN_APP_KEY || '').trim(),
    appSecret: (process.env.NEXCONN_APP_SECRET || '').trim(),
    primaryApiDomain: (process.env.NEXCONN_PRIMARY_API_DOMAIN || 'https://api.sg-light-api.com').trim(),
    secondaryApiDomain: (process.env.NEXCONN_SECONDARY_API_DOMAIN || 'https://api-b.sg-light-api.com').trim(),
  },

  // Supabase Configuration
  supabase: {
    url: (process.env.SUPABASE_URL || '').trim(),
    serviceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    anonKey: (process.env.SUPABASE_ANON_KEY || '').trim(),
  },

  // CORS
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').trim(),
};
