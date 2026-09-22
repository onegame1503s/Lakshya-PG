export async function sendBrevoEmail({ toEmail, toName, subject, htmlContent }: {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
}) {
  const BREVO_API_KEY = process.env.NEXT_BREVO_API_KEY;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Lakshya PG Management", email: "rahulbudhlakoti63@gmail.com" },
      to: [{ email: toEmail, name: toName }],
      subject: subject,
      htmlContent: htmlContent,
    }),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(`Brevo Error: ${JSON.stringify(errData)}`);
  }

  return true;
}