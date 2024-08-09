import { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { supabase } from "../clients/supabase";
import { Bullet, Experience as ExperienceType, Job } from "../utils/types";
import { rankBulletsPrompt } from "../utils/rank-bullets-prompt";
import { openai } from "../utils/clients/openai";

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
  const [rankedBullets, setRankedBullets] = useState<Bullet[]>([]);

  useEffect(() => {
    const fetchBullets = async () => {
      try {
        const { data: bullets, error } = await supabase
          .from("bullets")
          .select("*")
          .order("id", { ascending: true })
          .eq("experienceId", experience.id);

        if (error) {
          throw new Error(error.message);
        }

        if (bullets) {
          const chatCompletion = await openai.chat.completions.create({
            messages: [
              {
                role: "system",
                content: rankBulletsPrompt(bullets, job.description),
              },
            ],
            model: "gpt-4o",
          });

          const responseText = chatCompletion?.choices[0]?.message.content;

          console.log("OpenAI Response\n", responseText);
          if (!responseText) {
            throw new Error("general issue with cohere response");
          }

          const split = responseText.split("---");
          if (!(split.length === 2)) {
            throw new Error("Issue with cohere response text");
          }

          // console.log("cohere ranking", split[1]);
          const ranking = split[1]
            .trim()
            .split(",")
            .map((rank: string) => {
              return bullets[parseInt(rank) - 1];
            });
          setRankedBullets(ranking);
        }
      } catch (error) {
        console.error("Error fetching bullets:", error);
      }
    };
    fetchBullets();
  }, []);

  const moveBullet = (dragIndex: number, hoverIndex: number) => {
    const dragBullet = rankedBullets[dragIndex];
    const newBullets = [...rankedBullets];
    newBullets.splice(dragIndex, 1);
    newBullets.splice(hoverIndex, 0, dragBullet);
    setRankedBullets(newBullets);
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
        className="border-2 border-dashed border-gray-400 p-4 rounded-md cursor-move"
        style={{ opacity: isDragging ? 0.5 : 1 }}
        key={bullet.id}
      >
        {bullet.content}
      </li>
    );
  };

  console.log(rankedBullets);
  if (!selected) {
    return null;
  }

  if (!rankedBullets.length) {
    return <div>loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2 className="pb-4">{experience.title}</h2>
        <ul className="gap-2">
          {rankedBullets.map((bullet, index) => (
            <BulletItem key={bullet.id} bullet={bullet} index={index} />
          ))}
        </ul>
      </div>
    </DndProvider>
  );
};

export default Experience;
