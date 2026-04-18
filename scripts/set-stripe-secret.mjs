import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key) { console.error('STRIPE_SECRET_KEY not found in .env'); process.exit(1); }
console.log('Key length:', key.length, '| Starts:', key.substring(0, 20) + '...');
execSync(`npx supabase secrets set STRIPE_SECRET_KEY=${key}`, { stdio: 'inherit' });
console.log('Done.');
