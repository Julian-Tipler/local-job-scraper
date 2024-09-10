import { useEffect, useRef } from "react";
import { Skill } from "../utils/types";
import { fetchUserSkills } from "../api/fetchUserSkills";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// import { openai } from "../utils/clients/openai";
// import { rankSkillsPrompt } from "../utils/rank-skills-prompt";
import { useJobContext } from "../contexts/JobContext";
import {
  ResumeEntry,
  useSubmissionContext,
} from "../contexts/SubmissionContext";

const ItemTypes = {
  SKILL: "skill",
};

export const Skills = ({
  selected,
  variant,
}: {
  selected: boolean;
  variant: boolean;
}) => {
  const { resume, setResume } = useSubmissionContext();
  const { keyWords } = useJobContext();

  const index = variant ? 3 : 2;

  const resumeEntryValues = resume[index].values as Skill[];

  const { job } = useJobContext();
  useEffect(() => {
    if (!job) return;
    fetchUserSkills(1)
      .then((skills: Skill[]) => {
        const userSkills = skills.filter(
          (skill) => skill.type === (variant ? "technology" : "language")
        );

        const filteredUserSkills = userSkills.filter((userSkill) => {
          return userSkill.aliases.some((alias) =>
            keyWords.includes(alias)
          );
        });

        setResume((prev: ResumeEntry[]) => {
          const dupeMockResume = [...prev];
          dupeMockResume[index].values = filteredUserSkills;
          return dupeMockResume;
        });
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
      });
  }, []);

  const moveSkill = (dragIndex: number, hoverIndex: number) => {
    const dragSkill = resumeEntryValues[dragIndex];
    const newSkills = resumeEntryValues;
    newSkills.splice(dragIndex, 1);
    newSkills.splice(hoverIndex, 0, dragSkill);
    setResume((prev: ResumeEntry[]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[index].values = newSkills;
      return dupeNewForm;
    });
  };

  const deleteSkill = (index: number) => {
    const newSkills = [...resumeEntryValues];
    newSkills.splice(index, 1);
    setResume((prev: ResumeEntry[]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[index].values = newSkills;
      return dupeNewForm;
    });
  };

  const addSkill = (skillContent: string) => {
    const newSkills = [
      ...resumeEntryValues,
      {
        id: String(Math.random() * 1000),
        title: skillContent,
        created_at: new Date().toISOString(),
        type: "language",
        aliases: [],
      },
    ];
    setResume((prev: ResumeEntry[]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[index].values = newSkills;
      return dupeNewForm;
    });
  };

  const SkillItem = ({ skill, index }: { skill: Skill; index: number }) => {
    const ref = useRef<HTMLLIElement>(null);

    const [, drop] = useDrop({
      accept: ItemTypes.SKILL,
      // @ts-expect-error hover is fine
      hover(item: { index: number }, monitor: DropTargetMonitor) {
        if (!ref.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) {
          return;
        }

        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        moveSkill(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.SKILL,
      item: { type: ItemTypes.SKILL, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    drag(drop(ref));
    return (
      <li
        ref={ref}
        className="relative border-2 border-dashed border-gray-400 p-4 rounded-md cursor-move"
        style={{ opacity: isDragging ? 0.5 : 1 }}
        key={skill.id}
      >
        <button
          onClick={() => deleteSkill(index)}
          className="absolute top-1 right-1 text-gray-500 hover:text-red-500 "
        >
          ✕
        </button>
        {skill.title}
      </li>
    );
  };

  if (!selected) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <section className="flex flex-col flex-1 p-4 border overflow-hidden w-full gap-2">
        <h2>{resume[index].title}</h2>
        <ul className="flex-1 overflow-y-auto flex flex-col gap-1 px-3">
          {resumeEntryValues.map((skill, index) => (
            <SkillItem key={skill.id} skill={skill} index={index} />
          ))}
        </ul>
        <form>
          <input
            type="text"
            placeholder="Add bullet"
            className="border-2 border-gray-400 p-2 rounded-md"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </form>
      </section>
    </DndProvider>
  );
};

// put in its own file
// const rankUserLanguages = async (
//   userLanguages: Skill[],
//   description: string
// ) => {
//   const chatCompletion = await openai.chat.completions.create({
//     messages: [
//       {
//         role: "system",
//         content: rankSkillsPrompt(userLanguages, description),
//       },
//     ],
//     model: "gpt-3.5-turbo",
//   });
//   const responseText = chatCompletion?.choices[0]?.message.content;
//   return responseText;
// }
