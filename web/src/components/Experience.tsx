import { useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { supabase } from "../clients/supabase";
import { Bullet, Experience as ExperienceType, Job } from "../utils/types";
import { rankBulletsPrompt } from "../utils/rank-bullets-prompt";
import { openai } from "../utils/clients/openai";
import { useSubmissionContext } from "../contexts/SubmissionContext";

// Ideally the order of the experiences would be constant and saved in the db

const ItemTypes = {
  BULLET: "bullet",
};

const Experience = ({
  experience,
  selected,
  job,
}: {
  experience: ExperienceType;
  selected: boolean;
  job: Job;
}) => {
  const { bullets, setBullets } = useSubmissionContext();
  console.log(bullets);
  const entry = bullets[parseInt(experience.id) - 1];

  useEffect(() => {
    const fetchBullets = async () => {
      try {
        const { data: bullets, error } = await supabase
          .from("bullets")
          .select("*")
          .order("id", { ascending: true })
          .eq("experienceId", experience.id);

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

        // console.log("cohere ranking", split[1]);
        const ranking: Bullet[] = split[1]
          .trim()
          .split(",")
          .map((rank: string) => {
            return bullets[parseInt(rank) - 1];
          });
        setBullets((prev: Bullet[][]) => {
          const dupeNewForm = [...prev];
          dupeNewForm[parseInt(experience.id) - 1] = ranking;
          return dupeNewForm;
        });
      } catch (error) {
        console.error("Error fetching bullets:", error);
      }
    };
    fetchBullets();
  }, []);

  const moveBullet = (dragIndex: number, hoverIndex: number) => {
    const dragBullet = entry[dragIndex];
    const newBullets = [...entry];
    newBullets.splice(dragIndex, 1);
    newBullets.splice(hoverIndex, 0, dragBullet);
    setBullets((prev: Bullet[][]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[parseInt(experience.id) - 1] = newBullets;
      return dupeNewForm;
    });
  };

  const deleteBullet = (index: number) => {
    const newBullets = [...entry];
    newBullets.splice(index, 1);
    setBullets((prev: Bullet[][]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[parseInt(experience.id) - 1] = newBullets;
      return dupeNewForm;
    });
  };

  const addBullet = (bulletContent: string) => {
    const newBullets = [
      ...entry,
      {
        content: bulletContent,
        id: String(Math.random() * 1000),
        experienceId: experience.id,
        created_at: new Date().toISOString(),
      },
    ];
    setBullets((prev: Bullet[][]) => {
      const dupeNewForm = [...prev];
      dupeNewForm[parseInt(experience.id) - 1] = newBullets;
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

  if (!selected) {
    return null;
  }

  if (!entry?.length) {
    return <div>loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="flex flex-col flex-1 p-4 border overflow-hidden">
        <h2>{experience.title}</h2>
        <ul className="flex-1 overflow-y-auto flex flex-col gap-1">
          {entry.map((bullet, index) => (
            <BulletItem key={bullet.id} bullet={bullet} index={index} />
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
      </main>
    </DndProvider>
  );
};

export default Experience;
