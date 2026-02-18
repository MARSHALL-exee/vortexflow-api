import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { serviceType, complexity, timeline, name, email } = req.body;

    if (!serviceType || !complexity || !timeline || !name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await resend.emails.send({
      from: "VortexFlow Labs <contact@vortexflowlabs.com>",
      to: "contact@vortexflowlabs.com",
      subject: "New Quote Request",
      html: `<p>New quote from ${name} (${email})</p>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
