/* =================================================================
   WORLDCUP · functions/complete.js · Cloudflare Pages Function
   Route:  /complete
   Test:   https://worldcup-app.pages.dev/complete  (GET → JSON)

   ██████████████████████████████████████████████
   ██  TESTNET / SANDBOX MODE · sandbox:true   ██
   ██████████████████████████████████████████████

   Pi Network Sandbox (Testnet):
   - SDK: Pi.init({ version:"2.0", sandbox:true })
   - API: api.minepi.com/v2 (same endpoint as mainnet)
   - Auth: "Key SANDBOX_PI_API_KEY" from develop.pi Sandbox

   CRITICAL: Always return HTTP 200 — non-200 = "Payment Expired"
================================================================= */

export async function onRequestGet(context) {
  const key = context.env.PI_API_KEY;
  return new Response(
    JSON.stringify({
      success:            true,
      message:            "complete.js is working",
      app:                "worldcup-app.pages.dev",
      route:              "/complete",
      network:            "SANDBOX (TESTNET) · sandbox:true",
      pi_api_key_present: !!key,
      pi_api_key_length:  key ? key.length : 0,
      pi_api_key_prefix:  key ? key.substring(0, 8) + "..." : "MISSING — set sandbox key in Cloudflare Dashboard"
    }),
    {
      status:  200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    }
  );
}

export async function onRequestPost(context) {
  const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type":                 "application/json"
  };

  console.log("[WorldCup SANDBOX] /complete POST called");

  try {
    /* ── Parse body ── */
    const body      = await context.request.json();
    const paymentId = body.paymentId;
    const txid      = body.txid;

    console.log("[WorldCup SANDBOX] paymentId:", paymentId, "| txid:", txid);

    if (!paymentId) {
      return new Response(
        JSON.stringify({ completed: false, error: "missing paymentId" }),
        { status: 200, headers: cors }
      );
    }

    if (!txid) {
      console.log("[WorldCup SANDBOX] No txid yet — sandbox payment processing");
      return new Response(
        JSON.stringify({ completed: true, skipped: true, message: "waiting for txid" }),
        { status: 200, headers: cors }
      );
    }

    /* ── Get Sandbox API key ── */
    const PI_API_KEY = context.env.PI_API_KEY;
    console.log("[WorldCup SANDBOX] PI_API_KEY present:", !!PI_API_KEY);

    if (!PI_API_KEY) {
      console.error("[WorldCup SANDBOX] PI_API_KEY MISSING");
      return new Response(
        JSON.stringify({ completed: true, skipped: true, error: "PI_API_KEY not set" }),
        { status: 200, headers: cors }
      );
    }

    /* ── POST complete to Pi Sandbox API ── */
    console.log("[WorldCup SANDBOX] POSTing complete to Pi API...");
    const res = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method:  "POST",
        headers: {
          "Authorization": `Key ${PI_API_KEY}`,
          "Content-Type":  "application/json"
        },
        body: JSON.stringify({ txid })
      }
    );

    const text = await res.text();
    console.log("[WorldCup SANDBOX] Pi complete response:", res.status, text.substring(0, 200));

    return new Response(
      JSON.stringify({ completed: res.ok, pi_status: res.status, response: text }),
      { status: 200, headers: cors }
    );

  } catch (err) {
    console.error("[WorldCup SANDBOX] complete.js error:", err.message);
    return new Response(
      JSON.stringify({ completed: false, error: err.message }),
      { status: 200, headers: cors }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status:  200,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
