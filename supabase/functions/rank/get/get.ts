import { object, ObjectSchema, string } from "https://esm.sh/yup@1.2.0";
import { CompleteRequest } from "../../shared/models/requests.ts";
import { CORSResponse } from "../../shared/utils/cors.ts";
import { validate } from "../../shared/utils/validate.ts";
import { apiError } from "../../shared/utils/errors.ts";
import { ErrorCodes } from "../../shared/utils/errors.ts";
import { supabase } from "../../shared/utils/clients/supabase.ts";
import { coherePrompt } from "./cohere-prompt.ts";

type Bullet = {
  id: number;
  content: string;
  experience: number;
  created_at: string;
};

type Job = {
  id: number;
  title: string;
  url: string;
  description: string;
  created_at: string;
};

const COHERE_API_KEY = Deno.env.get("COHERE_API_KEY");

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
    const { jobId } = req.body;

    const { data: bullets, error: bulletsError }: {
      data: Bullet[] | null;
      error: any;
    } = await supabase.from(
      "bullets",
    ).select("*");

    if (!bullets || bulletsError) {
      return apiError(ErrorCodes.SERVER_ERROR, {
        error: bulletsError.message ?? "Error",
      });
    }
    // select single job
    const { data: job, error: jobsError }: {
      data: Job | null;
      error: any;
    } = await supabase.from("jobs").select(
      "*",
    ).eq("id", jobId).single();

    if (!job || jobsError) {
      return apiError(ErrorCodes.SERVER_ERROR, {
        error: jobsError.message ?? "Error",
      });
    }

    let bulletsString: string = "";

    bullets.map((bullet) => {
      bulletsString += `* ${bullet.content}\n`;
    });

    const message = coherePrompt + "job description:\n" + job.description +
      bulletsString;

    const chatBody = JSON.stringify({
      message: message,
      temperature: 0.2,
    });

    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COHERE_API_KEY}`,
      },
      body: chatBody,
    });

    const data = await response.json();
    console.log(data);

    return new CORSResponse(JSON.stringify("ok"));
  } catch (error) {
    console.error(error);
    return apiError(ErrorCodes.SERVER_ERROR, {
      error: error.message ?? "Error",
    });
  }
};

export const get = validate(handler, schema);
