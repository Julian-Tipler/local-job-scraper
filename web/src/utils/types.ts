export type Experience = {
  id: string;
  title: string;
  created_at: string;
  bullets: Bullet[];
};

export type Bullet = {
  id: string;
  experienceId: string;
  content: string;
  created_at: string;
};

export type Job = {
  id: string;
  title: string;
  url: string;
  description: string;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  created_at: string;
};

export type Skill = {
  id: string;
  title: string;
  aliases: string[];
  type: string;
};
