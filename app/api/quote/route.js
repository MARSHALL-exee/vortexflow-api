import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();

    const { serviceType, complexity, timeline, name, email } = body;

    if (!serviceType || !complexity || !timeline || !name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing fields" }),
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "VortexFlow Labs <contact@vortexflowlabs.com>",
      to: "contact@vortexflowlabs.com",
      subject: "New Quote Request",
      html: `<p>New quote from ${name} (${email})</p>`
    });

    return new Response(
      JSON.stringify({ success: true, message: "Quote received" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
