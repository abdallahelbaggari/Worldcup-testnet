/* =================================================================
   WORLDCUP · functions/cancel-payment.js · Cloudflare Pages Function
   Route:  /cancel-payment

   Called by onIncompletePayment when a payment has NO txid.
   
   Strategy for stuck payments (no txid, approved state):
   - Re-approve the payment via Pi API
   - Pi SDK will then retry the blockchain transaction
   - If blockchain succeeds → onReadyForServerCompletion fires
   - Payment resolves automatically
   
   TESTNET / SANDBOX MODE · sandbox:true
================================================================= */

export async function onRequestGet(context) {
  const key = context.env.PI_API_KEY;
  return new Response(
    JSON.stringify({
      success: true,
      message: 'cancel-payment.js is working',
      route:   '/cancel-payment',
      network: 'SANDBOX (TESTNET) · sandbox:true',
      pi_api_key_present: !!key,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}

export async function onRequestPost(context) {
  const cors = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type':                 'application/json',
  };

  console.log('[WorldCup SANDBOX] /cancel-payment called — re-approving stuck payment');

  try {
    const body      = await context.request.json();
    const paymentId = body.paymentId;

    if (!paymentId) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing paymentId' }),
        { status: 200, headers: cors }
      );
    }

    const PI_API_KEY = context.env.PI_API_KEY;
    if (!PI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'PI_API_KEY not set' }),
        { status: 200, headers: cors }
      );
    }

    console.log('[WorldCup SANDBOX] Re-approving stuck payment:', paymentId);

    /* Re-approve — this refreshes the payment state in Pi's system
       Pi SDK will then attempt the blockchain transaction again */
    const res = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method:  'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    const text = await res.text();
    console.log('[WorldCup SANDBOX] Re-approve response:', res.status, text.substring(0, 200));

    return new Response(
      JSON.stringify({ success: true, pi_status: res.status, response: text }),
      { status: 200, headers: cors }
    );

  } catch (err) {
    console.error('[WorldCup SANDBOX] cancel-payment error:', err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 200, headers: cors }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status:  200,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
