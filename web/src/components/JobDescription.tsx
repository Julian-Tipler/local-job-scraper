export const JobDescription = ({
  description,
}: {
  description: string;
}) => {
  return (
    <>
      <h2>Job Description</h2>
      <div>{description}</div>
    </>
  );
};
