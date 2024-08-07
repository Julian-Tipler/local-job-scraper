import { supabase } from "./clients/supabase.ts";

export async function authenticateMaybeUser({ req }: { req: any }) {
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
    console.error("supabase.auth.getUser error ", error);
  }

  if (error) {
    if (error.status === 403) return null;
    throw new Error(error.message);
  }

  if (!user || !user.id) {
    return null;
  }

  return user;
}
