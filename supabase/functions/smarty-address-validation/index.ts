// Supabase Edge Function: smarty-address-validation
// Validates and standardizes addresses using SmartyStreets API
import { serve } from "jsr:@std/http/server";

const SMARTY_AUTH_ID = Deno.env.get('SMARTY_AUTH_ID');
const SMARTY_AUTH_TOKEN = Deno.env.get('SMARTY_AUTH_TOKEN');

serve(async req => {
  try {
    const { address } = await req.json();
    if (!address || typeof address !== 'string') {
      return new Response(
        JSON.stringify({
          validated: false,
          error: 'Missing or invalid address',
        }),
        { status: 400 }
      );
    }
    if (!SMARTY_AUTH_ID || !SMARTY_AUTH_TOKEN) {
      return new Response(
        JSON.stringify({
          validated: false,
          error: 'Smarty credentials not set',
        }),
        { status: 500 }
      );
    }
    const url = `https://us-street.api.smarty.com/street-address?auth-id=${SMARTY_AUTH_ID}&auth-token=${SMARTY_AUTH_TOKEN}`;
    const body = JSON.stringify([{ street: address }]);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const data = await resp.json();
    if (
      Array.isArray(data) &&
      data.length > 0 &&
      data[0].analysis &&
      data[0].analysis.dpv_match_code === 'Y'
    ) {
      // Valid address
      return new Response(
        JSON.stringify({
          validated: true,
          standardized: {
            street: data[0].delivery_line_1,
            city: data[0].components.city_name,
            state: data[0].components.state_abbreviation,
            zip: data[0].components.zipcode,
          },
          raw: data[0],
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          validated: false,
          error: 'Address not valid',
          raw: data,
        }),
        { status: 200 }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        validated: false,
        error: err.message || 'Unknown error',
      }),
      { status: 500 }
    );
  }
});
