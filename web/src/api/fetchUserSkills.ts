import { supabase } from "../clients/supabase";

export const fetchUserSkills = async (userId: number) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("skills(*)")
      .eq("id", userId)
      .order("id", { foreignTable: "skills", ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    const skills = data[0].skills;
    return skills;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
};
