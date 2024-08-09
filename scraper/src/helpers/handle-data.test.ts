import { supabase } from "../clients/supabase";
import { handleData } from "./handle-data";
import { notify } from "./notify";

jest.mock("../clients/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    })),
  },
}));

jest.mock("./notify", () => ({
  notify: jest.fn(),
}));

describe("handleData", () => {
  const jobs = [
    { title: "Software Engineer", url: "https://example.com/job1" },
    { title: "Software Engineer", url: "https://example.com/job2" },
    { title: "Fullstack Engineer", url: "https://example.com/job3" },
  ];
  const website = "Example Website";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle data and insert unique jobs", async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({
        data: [
          { title: "Tester", url: "https://example.com/job3" },
          { title: "Fullstack Engineer", url: "https://example.com/job3" },
        ],
      }),
      insert: jest.fn().mockResolvedValueOnce({ error: null }),
    });

    const result = await handleData(jobs, website);

    expect(result).toEqual([{
      title: "Software Engineer",
      url: "https://example.com/job1",
    }, { title: "Software Engineer", url: "https://example.com/job2" }]);
    expect(notify).toHaveBeenCalledWith(result, website);
  });
});
