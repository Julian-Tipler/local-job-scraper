import { object, ObjectSchema, string } from "https://esm.sh/yup@1.2.0";
import { CompleteRequest } from "../../shared/models/requests.ts";
import { CORSResponse } from "../../shared/utils/cors.ts";
import { validate } from "../../shared/utils/validate.ts";
import { apiError } from "../../shared/utils/errors.ts";
import { ErrorCodes } from "../../shared/utils/errors.ts";

// https://supabase.com/docs/guides/functions/examples/send-emails

interface Req {
  body: {
    name: string;
    email: string;
    message: string;
  };
}

const schema: ObjectSchema<Req> = object({
  body: object({
    name: string().required(),
    email: string().required(),
    message: string().required(),
  }),
});

const handler = async (req: CompleteRequest): Promise<Response> => {
  try {
    const { name, email, message } = req.body;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "WisePilot Contact Form Request <onboarding@resend.dev>",
        to: ["support@wisepilot.io"],
        subject: `New message from ${name} (${email})`,
        html: `<p>${message}</p>`,
      }),
    });

    return new CORSResponse(JSON.stringify("ok"));
  } catch (error) {
    console.error(error);
    return apiError(ErrorCodes.SERVER_ERROR, {
      error: error.message ?? "Error",
    });
  }
};

export const get = validate(handler, schema);
