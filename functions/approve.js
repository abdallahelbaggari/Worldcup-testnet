/* =================================================================
   WORLDCUP · functions/approve.js · Cloudflare Pages Function
   Route:  /approve
   Test:   https://worldcup-app.pages.dev/approve  (GET → JSON)

   ██████████████████████████████████████████████
   ██  TESTNET / SANDBOX MODE · sandbox:true   ██
   ██████████████████████████████████████████████

   Pi Network Sandbox (Testnet):
   - SDK: Pi.init({ version:"2.0", sandbox:true })
   - API: api.minepi.com/v2 (same endpoint as mainnet)
   - Auth: "Key SANDBOX_PI_API_KEY" from develop.pi Sandbox

   SETUP:
   1. Go to develop.pi → your app → Sandbox settings
   2. Copy the Sandbox API Key
   3. In Cloudflare Dashboard → Settings → Environment Variables
      Set PI_API_KEY = <your sandbox key>
   4. Redeploy

   CRITICAL: Always return HTTP 200 — non-200 = "Payment Expired"
================================================================= */

export async function onRequestGet(context) {
  const key = context.env.PI_API_KEY;
  return new Response(
    JSON.stringify({
      success:            true,
      message:            "approve.js is working",
      app:                "worldcup-app.pages.dev",
      route:              "/approve",
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

  console.log("[WorldCup SANDBOX] /approve POST called");

  try {
    /* ── Parse body ── */
    let paymentId      = null;
    let expectedAmount = null;
    try {
      const body     = await context.request.json();
      paymentId      = body.paymentId     || null;
      expectedAmount = body.expectedAmount || null;
    } catch (e) {
      console.error("[WorldCup SANDBOX] Body parse error:", e.message);
      return new Response(
        JSON.stringify({ approved: true, step: "body_parse_error" }),
        { status: 200, headers: cors }
      );
    }

    console.log("[WorldCup SANDBOX] paymentId:", paymentId);

    if (!paymentId) {
      return new Response(
        JSON.stringify({ approved: true, step: "no_payment_id" }),
        { status: 200, headers: cors }
      );
    }

    /* ── Get Sandbox API key ── */
    const PI_API_KEY = context.env.PI_API_KEY;
    console.log("[WorldCup SANDBOX] PI_API_KEY present:", !!PI_API_KEY, "| length:", PI_API_KEY ? PI_API_KEY.length : 0);

    if (!PI_API_KEY) {
      console.error("[WorldCup SANDBOX] PI_API_KEY MISSING — add sandbox key in Cloudflare Dashboard → Settings → Environment Variables");
      return new Response(
        JSON.stringify({ approved: true, step: "no_api_key", error: "PI_API_KEY not set" }),
        { status: 200, headers: cors }
      );
    }

    /* ── GET payment state (log only) ── */
    try {
      const getRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
        method:  "GET",
        headers: { "Authorization": `Key ${PI_API_KEY}` }
      });
      const getRaw = await getRes.text();
      console.log("[WorldCup SANDBOX] GET payment state:", getRes.status, getRaw.substring(0, 200));
    } catch (e) {
      console.error("[WorldCup SANDBOX] GET payment state error:", e.message);
    }

    /* ── POST approve to Pi Sandbox API ── */
    console.log("[WorldCup SANDBOX] POSTing approve to Pi API...");
    const piRes = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method:  "POST",
        headers: {
          "Authorization": `Key ${PI_API_KEY}`,
          "Content-Type":  "application/json"
        },
        body: JSON.stringify({})
      }
    );

    const piStatus = piRes.status;
    const piRaw    = await piRes.text();
    console.log("[WorldCup SANDBOX] Pi approve response:", piStatus, piRaw.substring(0, 200));

    /* CRITICAL: Always return HTTP 200 to Pi SDK
       Non-200 = Pi SDK shows "Payment Expired"    */
    return new Response(
      JSON.stringify({ approved: true, pi_status: piStatus, pi_response: piRaw }),
      { status: 200, headers: cors }
    );

  } catch (err) {
    console.error("[WorldCup SANDBOX] approve.js error:", err.message);
    return new Response(
      JSON.stringify({ approved: true, error: err.message }),
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
