import { createAdminClient } from 'npm:@insforge/sdk';

export default async function(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json().catch(() => ({}));
  const password = body.password || '';
  const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || '';

  if (password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const action = body.action || 'list';

  try {
    const admin = createAdminClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL') || '',
      apiKey: Deno.env.get('API_KEY') || '',
    });

    if (action === 'list') {
      const { data, error } = await admin.database
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ data: data || [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete') {
      const id = body.id;
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { error } = await admin.database
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
