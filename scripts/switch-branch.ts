import * as fs from 'fs';

const dotenv = require('dotenv');



// Load existing env file if it exists

dotenv.config();



interface BranchConfig {

  name: string;

  pooled: string;

  direct: string;

}



const branches: Record<string, BranchConfig> = {

  main: {

    name: 'main',

    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-raspy-grass-a1ktauyn-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-raspy-grass-a1ktauyn.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',

  },
  development: {
    name: 'development',
    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-fancy-grass-a1x6383h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-fancy-grass-a1x6383h.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
  'feature-testing': {
    name: 'feature-testing',
    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-weathered-unit-a1ywc1d6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-weathered-unit-a1ywc1d6.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
  auth: {
    name: 'auth',
    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-lively-haze-a1cwkf1z-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-lively-haze-a1cwkf1z.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
  'calendar-core': {
    name: 'calendar-core',
    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-snowy-sunset-a1t8tfeb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-snowy-sunset-a1t8tfeb.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
  integrations: {
    name: 'integrations',
    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-polished-haze-a15jeegw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-polished-haze-a15jeegw.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
  staging: {
    name: 'staging',
    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-polished-butterfly-a15tfkbw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-polished-butterfly-a15tfkbw.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
  backup: {
    name: 'backup',
    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-steep-shadow-a1qfsm2d-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-steep-shadow-a1qfsm2d.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
  hotfix: {
    name: 'hotfix',
    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-empty-star-a1jic8l1-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-empty-star-a1jic8l1.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
  analytics: {
    name: 'analytics',
    pooled: 'postgresql://neondb_owner:EkINQLzfGv01@ep-lucky-credit-a1psukyy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    direct: 'postgresql://neondb_owner:EkINQLzfGv01@ep-lucky-credit-a1psukyy.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },

};



const branch = process.argv[2];



if (!branch || !branches[branch]) {

  console.error('Please specify a valid branch:', Object.keys(branches).join(', '));

  process.exit(1);

}



const envContent = `

DATABASE_URL="${branches[branch].pooled}"

DIRECT_URL="${branches[branch].direct}"

NEXTAUTH_URL="http://localhost:3000"

NEXTAUTH_SECRET="${process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-key'}"

GOOGLE_CLIENT_ID="${process.env.GOOGLE_CLIENT_ID || ''}"

GOOGLE_CLIENT_SECRET="${process.env.GOOGLE_CLIENT_SECRET || ''}"

JWT_SECRET="${process.env.JWT_SECRET || 'your-jwt-secret-key'}"

`.trim();



fs.writeFileSync('.env', envContent);



console.log(`Switched to ${branch} branch`);


