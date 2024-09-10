import { useJobContext } from "../contexts/JobContext";

export const KeyWords = () => {
  const { keyWords } = useJobContext();

  if (!keyWords.length) return <div>Loading key words...</div>;
  return (
    <>
      {keyWords.map((keyWord, index) => (
        <span key={keyWord.word}>
          <span className={keyWord.bold ? "font-bold" : ""}>
            {keyWord.word}
          </span>
          {index < keyWords.length - 1 && ", "}
        </span>
      ))}
    </>
  );
};
