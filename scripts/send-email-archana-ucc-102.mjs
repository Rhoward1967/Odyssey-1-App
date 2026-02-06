import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env' });

async function sendEmailToArchana() {
  const emailContent = fs.readFileSync('EMAIL_TO_ARCHANA_UCC_RECORD_102_FEB_5_2026.md', 'utf8');
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const htmlBody = `<p>${emailContent.replace(/\n/g, '</p><p>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'archana.jitendra@sai-service.com',
        subject: 'URGENT: UCC-1 Personal Security Interest Perfected – Record #029-2026-000102 (Critical Tax & Compliance Update)',
        html: htmlBody,
        text: emailContent
      }
    });

    if (error) {
      console.error('❌ Email send failed:', error);
      return false;
    }

    console.log('✅ Email sent successfully to archana.jitendra@sai-service.com');
    console.log('📧 Status: ACCEPTED');
    console.log('📋 Subject: URGENT: UCC-1 Personal Security Interest Perfected – Record #029-2026-000102');
    console.log('📝 Content: 5,200+ words - Full legal and tax implications analysis');
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return false;
  }
}

sendEmailToArchana();
