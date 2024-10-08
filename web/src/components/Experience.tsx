import { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { supabase } from "../clients/supabase";
import { Bullet, Job } from "../utils/types";
import { rankBulletsPrompt } from "../utils/rank-bullets-prompt";
import { openai } from "../utils/clients/openai";
import {
  ResumeEntry,
  useSubmissionContext,
} from "../contexts/SubmissionContext";

// Ideally the order of the experiences would be constant and saved in the db

const ItemTypes = {
  BULLET: "bullet",
};

export const Experience = ({
  index,
  selected,
  job,
}: {
  index: number;
  selected: boolean;
  job: Job;
}) => {
  const { resume, setResume } = useSubmissionContext();
  const [unusedBullets, setUnusedBullets] = useState<Bullet[]>([]);

  const experienceId = index + 1;
  const resumeEntryValues = resume[index].values as Bullet[];

  useEffect(() => {
    const fetchBullets = async () => {
      try {
        const { data: bullets, error } = await supabase
          .from("bullets")
          .select("*")
          .order("id", { ascending: true })
          .eq("experienceId", experienceId);

        if (error || !bullets) {
          throw new Error(error.message);
        }

        const chatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: rankBulletsPrompt(bullets, job.description),
            },
          ],
          model: "gpt-3.5-turbo",
        });

        const responseText = chatCompletion?.choices[0]?.message.content;

        if (!responseText) {
          throw new Error("general issue with cohere response");
        }
        console.log("OpenAI Response\n", responseText);

        const split = responseText.split("---");
        if (!(split.length === 2)) {
          throw new Error("Issue with cohere response text");
        }

        const ranking: Bullet[] = split[1]
          .trim()
          .split(",")
          .map((rank: string) => {
            return bullets[parseInt(rank) - 1];
          });
        const unusedBullets = bullets.filter((bullet) => {
          return !ranking
            .map((rankedBullet) => rankedBullet.id)
            .includes(bullet.id);
        });

        setUnusedBullets(unusedBullets);
        setResume((prev: ResumeEntry[]) => {
          const dupeMockResume = [...prev];
          dupeMockResume[index].values = ranking;
          return dupeMockResume;
        });
      } catch (error) {
        console.error("Error fetching bullets:", error);
      }
    };
    fetchBullets();
  }, []);

  const moveBullet = (dragIndex: number, hoverIndex: number) => {
    const dragBullet = resumeEntryValues[dragIndex];
    const newBullets = resumeEntryValues;
    newBullets.splice(dragIndex, 1);
    newBullets.splice(hoverIndex, 0, dragBullet);
    setResume((prev: ResumeEntry[]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[index].values = newBullets;
      return dupeNewForm;
    });
  };

  const deleteBullet = (deleteIndex: number) => {
    const newBullets = [...resumeEntryValues];
    const deletedBullets = newBullets.splice(deleteIndex, 1);
    setResume((prev: ResumeEntry[]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[index].values = newBullets;
      return dupeNewForm;
    });
    setUnusedBullets((prev) => [...prev, ...deletedBullets]);
  };

  const addBullet = (bulletContent: string) => {
    const newBullets = [
      ...resumeEntryValues,
      {
        content: bulletContent,
        id: String(Math.random() * 1000),
        experienceId: String(experienceId),
        created_at: new Date().toISOString(),
      },
    ];
    setResume((prev: ResumeEntry[]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[index].values = newBullets;
      return dupeNewForm;
    });
  };

  const BulletItem = ({ bullet, index }: { bullet: Bullet; index: number }) => {
    const ref = useRef<HTMLLIElement>(null);

    const [, drop] = useDrop({
      accept: ItemTypes.BULLET,
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

        // Gives you the rectangle of the item being hovered over
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverUpwardThreshold = hoverMiddleY * 1.5; // Switch closer to the top when dragging upwards
        const hoverDownwardThreshold = hoverMiddleY * 0.5; // Switch closer to the bottom when dragging downwards

        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

        // Dragging up
        if (dragIndex < hoverIndex && hoverClientY < hoverDownwardThreshold) {
          return;
        }

        // Dragging down
        if (dragIndex > hoverIndex && hoverClientY > hoverUpwardThreshold) {
          return;
        }

        moveBullet(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.BULLET,
      item: { type: ItemTypes.BULLET, index },
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
        key={bullet.id}
      >
        <button
          onClick={() => deleteBullet(index)}
          className="absolute top-1 right-1 text-gray-500 hover:text-red-500 "
        >
          ✕
        </button>
        {bullet.content}
      </li>
    );
  };

  const moveFromUnused = (bullet: Bullet) => {
    const newSkills = [...resumeEntryValues, bullet];
    setResume((prev: ResumeEntry[]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[index].values = newSkills;
      return dupeNewForm;
    });
    setUnusedBullets((prev) => prev.filter((s) => s.id !== bullet.id));
  };

  if (!selected) {
    return null;
  }

  if (!resume[index].values.length && !unusedBullets.length) {
    return <div>loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <section className="flex flex-col flex-1 p-4 border overflow-hidden w-full gap-2">
        <h2>{resume[index].title}</h2>
        <ul className="flex-[2_2_0%] overflow-y-auto flex flex-col gap-1 px-3">
          {resumeEntryValues.map((bullet, index) => (
            <BulletItem key={bullet.id} bullet={bullet} index={index} />
          ))}
        </ul>
        <h3>unused</h3>
        <ul className="flex-1 overflow-y-auto flex flex-col gap-1 px-3">
          {unusedBullets.map((bullet) => (
            <li
              onClick={() => moveFromUnused(bullet)}
              key={`unused-skill-${bullet.id}`}
              className="relative border-2 border-dashed border-gray-400 p-2 rounded-md cursor-move"
            >
              {bullet.content}
            </li>
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
                addBullet(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </form>
      </section>
    </DndProvider>
  );
};
