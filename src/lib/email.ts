// Sends email through Resend when RESEND_API_KEY is set; otherwise logs to the console.

type Mail = { to: string; subject: string; html: string };

export async function sendEmail(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[email] To: ${mail.to}\n[email] Subject: ${mail.subject}\n[email] ${mail.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: mail.to, subject: mail.subject, html: mail.html }),
    });
    if (!res.ok) console.error("[email] send failed", res.status, await res.text());
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

export function emailLayout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5efe6;font-family:Georgia,serif;color:#14202b">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <p style="letter-spacing:.25em;text-transform:uppercase;font-size:11px;color:#8a6a3b;margin:0 0 24px">${title}</p>
    ${body}
  </div></body></html>`;
}
