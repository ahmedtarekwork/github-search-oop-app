export type UserType = Record<
  "avatar_url" | "bio" | "blog" | "created_at" | "html_url" | "login" | "name",
  string
> &
  Record<"followers" | "following" | "public_repos", number>;

export type RepoType = Record<
  | "clone_url"
  | "commits_url"
  | "created_at"
  | "default_branch"
  | "html_url"
  | "name"
  | "full_name"
  | "url"
  | "homepage"
  | "ssh_url",
  string
> & {
  languages_url?: string;
  description?: string;
  watchers_count: number;
  id: number;
  owner: UserType;
};

export type CommitType = {
  html_url: string;
  sha: string;
  commit: {
    message: string;
    committer: { date: string };
    tree: { url: string };
  };
  author: UserType;
};

// branches_url
