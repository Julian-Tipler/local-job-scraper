import { supabase } from "./clients/supabase.ts";
import { CompleteRequest } from "../models/requests.ts";

export async function authenticateUser({ req }: { req: CompleteRequest }) {
  const token = req.headers.Authorization?.split(" ")[1];

  if (!token) {
    console.error("Authorization token not provided");
    throw new Error("Authorization token not provided");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error) {
    if (error.message === "invalid claim: missing sub claim") {
      console.error("Using Anonymous token instead of user token");
      throw new Error("Using Anonymous token instead of user token");
    }
    console.error(error.message);
    throw new Error(error.message);
  }

  if (!user || !user.id) {
    console.error("User not found");
    throw new Error("User not found");
  }

  return user;
}
