/* =================================================================
   WORLDCUP · functions/cancel-payment.js · Cloudflare Pages Function
   Route:  /cancel-payment

   Called by onIncompletePayment when a payment has NO txid —
   meaning it was never submitted to the blockchain and must be
   cancelled so the user can start a new payment.

   Pi SDK flow:
   onIncompletePayment(payment) fired on authenticate
     → payment.transaction.txid missing
     → POST /cancel-payment { paymentId }
     → We call Pi API DELETE /payments/:id
     → Pi clears the pending payment
     → User can now make a new payment

   TESTNET / SANDBOX MODE · sandbox:true
================================================================= */

export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'cancel-payment.js is working',
      route:   '/cancel-payment',
      network: 'SANDBOX (TESTNET) · sandbox:true',
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

  console.log('[WorldCup SANDBOX] /cancel-payment POST called');

  try {
    const body      = await context.request.json();
    const paymentId = body.paymentId;

    console.log('[WorldCup SANDBOX] Cancelling paymentId:', paymentId);

    if (!paymentId) {
      return new Response(
        JSON.stringify({ cancelled: false, error: 'missing paymentId' }),
        { status: 200, headers: cors }
      );
    }

    const PI_API_KEY = context.env.PI_API_KEY;
    if (!PI_API_KEY) {
      console.error('[WorldCup SANDBOX] PI_API_KEY missing');
      return new Response(
        JSON.stringify({ cancelled: false, error: 'PI_API_KEY not set' }),
        { status: 200, headers: cors }
      );
    }

    /* ── Cancel via Pi API ── */
    const res = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
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
    console.log('[WorldCup SANDBOX] Pi cancel response:', res.status, text.substring(0, 200));

    return new Response(
      JSON.stringify({ cancelled: true, pi_status: res.status, response: text }),
      { status: 200, headers: cors }
    );

  } catch (err) {
    console.error('[WorldCup SANDBOX] cancel-payment error:', err.message);
    return new Response(
      JSON.stringify({ cancelled: false, error: err.message }),
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
