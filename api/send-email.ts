const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, subject, message, sessionId } = req.body || {};

  if (!email || !message) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.RESEND_TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    res.status(500).json({ error: 'Email service not configured' });
    return;
  }

  const safeName = escapeHtml(String(name || 'Evri User'));
  const safeEmail = escapeHtml(String(email));
  const safeSubject = escapeHtml(String(subject || 'New Evri message'));
  const safeMessage = escapeHtml(String(message));
  const safeSession = escapeHtml(String(sessionId || 'N/A'));

  const payload = {
    from: fromEmail,
    to: [toEmail],
    subject: safeSubject,
    reply_to: safeEmail,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">
        <h2>New Evri Contact Message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Session:</strong> ${safeSession}</p>
        <hr />
        <p>${safeMessage.replace(/\n/g, '<br/>')}</p>
      </div>
    `,
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(500).json({ error: 'Resend error', details: data });
      return;
    }

    res.status(200).json({ ok: true, id: data.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Email send failed', details: err?.message });
  }
}
