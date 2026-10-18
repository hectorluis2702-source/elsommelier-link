/* Example serverless endpoint to verify and record purchases using Supabase service_role key.
   Deploy this as a Vercel/Netlify function or small Node service. Do NOT put the service_role key in source.
   Set env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
*/

import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(bodyParser.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Simple in-memory rate limiter (example only; replace with real store in prod)
const RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 30;
const ipBuckets = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const bucket = ipBuckets.get(ip) || { ts: now, count: 0 };
  if (now - bucket.ts > RATE_WINDOW_MS) {
    bucket.ts = now; bucket.count = 0;
  }
  bucket.count += 1;
  ipBuckets.set(ip, bucket);
  return bucket.count <= MAX_PER_WINDOW;
}

app.post('/verify-purchase', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!rateLimit(ip)) return res.status(429).json({ error: 'rate_limited' });

  const { access_token, items, total } = req.body;
  if (!access_token || !items) return res.status(400).json({ error: 'missing_fields' });

  // Verify token and get user
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(access_token);
  if (userErr || !userData?.user) return res.status(401).json({ error: 'invalid_token' });
  const userId = userData.user.id;

  // TODO: Integrate payment provider webhook verification here (Stripe, etc.)
  // Record purchase server-side using service_role key so RLS won't block it.
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .insert({ user_id: userId, items: JSON.stringify(items), total })
    .select()
    .single();

  if (error) {
    console.error('Error inserting purchase:', error);
    return res.status(500).json({ error: 'db_error' });
  }

  return res.json({ ok: true, purchase: data });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`verifyPurchase example listening on ${port}`));
