import { useEffect, useState } from "react";
import { supabase } from "../clients/supabase";
import { Experience as ExperienceType } from "../utils/types";
import { Job } from "../utils/types";
import Experience from "./Experience";

export const ExperienceStepper = ({ job }: { job: Job }) => {
  const [step, setStep] = useState(0);

  const [experiences, setExperiences] = useState<ExperienceType[]>([]);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const { data: experiences, error } = await supabase
          .from("experiences")
          .select("*");

        if (error) {
          throw new Error(error.message);
        }

        setExperiences(experiences);
      } catch (error) {
        console.error("Error fetching experiences:", error);
      }
    };

    fetchExperiences();
  }, []);

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    setStep((prevStep) => prevStep - 1);
  };

  if (!experiences.length) return <div>Loading...</div>;
  return (
    <div className="flex flex-col w-1/2 p-4 h-full">
      {/* Left Column Title */}
      <h1 className="px-4 ">Left Column</h1>
      {/* Middle Section */}
      <main className="flex flex-col flex-1 p-4 border border-red-300 overflow-hidden">
        <h2>Experience Title</h2>
        <ul className="flex-1 overflow-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
          ultricies dapibus laoreet. Duis vestibulum erat risus, eget vehicula
          arcu feugiat eu. Nunc ut ultricies arcu. Vestibulum vel cursus diam.
          Vestibulum mauris sapien, tincidunt vitae dignissim in, molestie vitae
          leo. Curabitur luctus purus eget ligula faucibus accumsan. Ut a
          lacinia felis. Nam vel mi ut risus mattis blandit. Etiam sollicitudin
          mi et mi gravida, ut auctor urna dignissim. Quisque at tortor lectus.
          Cras a consectetur elit, eu porttitor justo. Pellentesque sapien nunc,
          congue nec sapien eget, scelerisque sodales nisi. Donec ut porttitor
          leo. Maecenas aliquam dictum sapien. Nunc vitae massa a velit porta
          venenatis. Etiam vel nibh accumsan, rhoncus tortor sed, condimentum
          libero. Duis sed commodo ante, in blandit odio. Nunc vel est sagittis,
          facilisis ligula sit amet, luctus quam. Quisque eu nisl erat. Nulla
          quis feugiat ante. Quisque id imperdiet diam. Phasellus ac risus in
          tortor laoreet laoreet. Aliquam erat volutpat. Fusce et ex nisl. Donec
          vitae risus a nisl ultrices viverra et quis nulla. Suspendisse
          facilisis tristique sem, a faucibus elit tempus eget. Fusce eros
          justo, fermentum a ex vel, ultricies varius nulla. Proin commodo nulla
          quis diam viverra euismod. Pellentesque id venenatis leo, sed
          consectetur augue. Curabitur tempus mollis nisl, a hendrerit metus
          viverra ut. Nulla facilisi. Nullam posuere pellentesque dapibus.
          Suspendisse venenatis viverra purus et aliquam. Phasellus a
          ullamcorper lorem. Aenean dignissim tortor diam. Duis vel nibh
          blandit, cursus ante quis, porta tellus. Suspendisse gravida
          pellentesque justo et pulvinar. Aliquam pulvinar scelerisque
          tincidunt. Fusce vel tincidunt massa. Nulla mollis, risus ut ultricies
          dapibus, erat magna consequat tellus, sit amet congue mi risus id
          turpis. Nunc vulputate tincidunt est at fringilla. Fusce ac ultrices
          sapien. Etiam malesuada nisl eu est finibus iaculis. Proin ullamcorper
          ex ultrices dapibus accumsan. Curabitur nibh nibh, congue a nisl id,
          sollicitudin mollis turpis. Phasellus egestas nulla et sapien euismod
          dignissim. Proin nec dolor molestie, suscipit risus non, cursus
          turpis. In vulputate arcu sed eros molestie, ac aliquet ligula
          commodo. Maecenas vel neque venenatis, condimentum ipsum eget, lacinia
          lorem.
        </ul>
      </main>
      {/* {experiences.map((experience, i) => {
          return (
            <Experience
              key={experience.id}
              experience={experience}
              selected={i === step}
              job={job}
            />
          );
        })} */}
      {/* Navigation Buttons */}
      <div className="button-container flex gap-4 p-4">
        <button
          onClick={handlePrevious}
          disabled={step === 0}
          className={`px-4 py-2 rounded ${
            step === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={step === experiences.length - 1}
          className={`px-4 py-2 rounded ${
            step === experiences.length - 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
