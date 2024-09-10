import { useEffect, useState } from "react";
import { supabase } from "../clients/supabase";
import { useJobContext } from "../contexts/JobContext";
import { Group } from "../utils/types";

export const GroupsDropDown = () => {
  const { job } = useJobContext();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await supabase.from("groups").select("*");
        if (error) {
          throw error;
        }
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupSelect = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedIndex = parseInt(event.target.value);
    // Call the setGroup function with the selected group ID
    const selectedGroup = groups[selectedIndex];

    try {
      const { error } = await supabase
        .from("jobs")
        .update({ groupId: selectedGroup.id })
        .eq("id", job.id);
      if (error) {
        throw error;
      }
      console.log("Group ID updated successfully");
    } catch (error) {
      console.error("Error updating group ID:", error);
    }
  };

  return (
    <div>
      <select onChange={handleGroupSelect} value="">
        <option value="">Select a group</option>
        {groups.map((group, index) => (
          <option key={group.id} value={index}>
            {group.name}
          </option>
        ))}
      </select>
    </div>
  );
};
