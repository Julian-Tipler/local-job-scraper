import { useState } from "react";
import { supabase } from "../../clients/supabase";
import { useNavigate } from "react-router-dom";

export const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setLoading(true);
    setError([]);

    const { data, error } = await supabase
      .from("jobs")
      .insert([{ title, url, description }])
      .select();

    if (error || !data) {
      setError(["Failed to save the job. Please try again."]);
    } else {
      setSuccess(true);
      setTitle("");
      setUrl("");
      setDescription("");
      const jobId = data[0].id;
      navigate(`/job/${jobId}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Add a Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="title"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="url"
          >
            URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? "Saving..." : "Submit"}
        </button>

        {error && <p className="mt-4 text-red-500">{error}</p>}
        {success && (
          <p className="mt-4 text-green-500">Job saved successfully!</p>
        )}
      </form>
    </div>
  );
};
