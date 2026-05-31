const DISPOSABLE_DOMAINS = [
  'mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com',
  'throwaway.email','yopmail.com','trashmail.com','sharklasers.com',
  'maildrop.cc','getairmail.com','mytemp.email','fakeinbox.com',
  'mailcatch.com','tempinbox.com','spambox.us','dispostable.com',
  'mailnesia.com','mailexpire.com','spamgourmet.com','emailondeck.com',
  'temp-mail.org','minuteinbox.com','guerrillamail.org',
];

export default async function(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json().catch(() => ({}));
  const email = (body.email || '').trim().toLowerCase();

  if (!email) {
    return new Response(JSON.stringify({ valid: false, reason: 'Email is required' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ valid: false, reason: 'Invalid email format' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const domain = email.split('@')[1];

  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return new Response(JSON.stringify({ valid: false, reason: 'Disposable email not allowed' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const mxRecords = await Deno.resolveDns(domain, 'MX');
    if (!mxRecords || mxRecords.length === 0) {
      return new Response(JSON.stringify({ valid: false, reason: 'Domain does not accept email' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ valid: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ valid: false, reason: 'Domain not found' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
