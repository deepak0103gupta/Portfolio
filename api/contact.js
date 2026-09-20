// Vercel serverless function: POST /api/contact
// Sends the contact-form message to your inbox through Resend (https://resend.com).
// Required env vars: RESEND_API_KEY, CONTACT_TO_EMAIL. Optional: CONTACT_FROM_EMAIL.

const LIMITS = { name: 100, email: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, max) {
  return String(value == null ? "" : value).replace(/\r/g, "").trim().slice(0, max);
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return {};
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const body = readBody(req);

  // Bots tend to fill hidden fields or submit instantly. Pretend it worked and drop it.
  const elapsed = Number(body.elapsed);
  if (clean(body.company, 200) || (Number.isFinite(elapsed) && elapsed < 1500)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name).replace(/\n+/g, " ");
  const email = clean(body.email, LIMITS.email).replace(/\n+/g, "");
  const message = clean(body.message, LIMITS.message);

  if (!name) return res.status(400).json({ ok: false, error: "Please enter your name." });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  if (message.length < 10) return res.status(400).json({ ok: false, error: "Please write a message of at least 10 characters." });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("contact: RESEND_API_KEY or CONTACT_TO_EMAIL is not set");
    return res.status(500).json({ ok: false, error: "The contact form is not set up yet." });
  }
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: "Portfolio message from " + name,
        text: "Name: " + name + "\nEmail: " + email + "\n\n" + message
      })
    });

    if (!response.ok) {
      console.error("contact: Resend responded", response.status, await response.text());
      return res.status(502).json({ ok: false, error: "The message could not be sent." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact: request to Resend failed", err);
    return res.status(502).json({ ok: false, error: "The message could not be sent." });
  }
};
