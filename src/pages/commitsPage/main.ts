import CopyBtn, {
  type GenerateCopyBtnFnType,
} from "../../components/copyBtn/CopyBtn";

import { formatDistanceToNow } from "date-fns";
import { fetchData, generateUserAvatar } from "../../utils";

import type { CommitType } from "../../types";

type ParamsType = Record<"url" | "repoName" | "repoURL", string>;

const params = Object.fromEntries(
  new URLSearchParams(location.search).entries()
) as ParamsType;

abstract class Commits {
  constructor() {}

  protected _sortCommitsByDate(commits: CommitType[]) {
    let sortedCommits = {} as Record<string, CommitType[]>;

    commits.forEach((commit) => {
      const date = new Date(commit.commit.committer.date).toLocaleDateString(
        "en-US",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );

      if (sortedCommits[date]) return sortedCommits[date].push(commit);

      sortedCommits[date] = [commit];
    });

    const sortByMonthAndDay = Object.entries(sortedCommits).sort((a, b) => {
      const DateOne = new Date(a[0]);
      const DateTwo = new Date(b[0]);

      return DateTwo.getTime() - DateOne.getTime();
    });

    sortedCommits = Object.fromEntries(sortByMonthAndDay);

    return sortedCommits;
  }

  protected async _getCommits() {
    document.getElementById("get-commits-error-msg")?.remove();

    return await fetchData({
      url: params.url.replace("{/sha}", ""),
      loadingMsg: {
        loadingMsgId: "loading-msg",
        loadingMsgParent: document.querySelector("main")!,
      },
      errorMsg: {
        errorMsg: "can't get this repo commets at the momment",
        erorrMsgId: "get-commits-error-msg",
        errorMsgParent: document.querySelector("main")!,
      },
    });
  }
}

abstract class CommitRightSide extends Commits {
  constructor(protected _copyBtn: GenerateCopyBtnFnType) {
    super();
  }

  protected _generateCommitRightSide({
    sha,
    commit: {
      tree: { url },
    },
  }: CommitType) {
    const rightSide = document.createElement("div");
    rightSide.className = "commit-slice-right-side";

    const shaEl = this._showCommitSHA(sha);

    const copyShaBtn = this._copyBtn({
      className: "copy-commit-sha-btn",
      copyContent: sha,
      btnContent: "",
    });

    const showRepoAtThisCommetBtn = this._showRepoAtThisCommit(
      url,
      params.repoName,
      sha
    );

    rightSide.append(shaEl, copyShaBtn, showRepoAtThisCommetBtn);

    return rightSide;
  }

  private _showCommitSHA(sha: string) {
    const shaEl = document.createElement("p");
    shaEl.className = "sha-content";
    shaEl.textContent = sha.slice(0, 6);

    return shaEl;
  }

  private _showRepoAtThisCommit(
    commitTreeUrl: string,
    repoName: string,
    sha: string
  ) {
    const showRepoAtThisCommetBtn = document.createElement("a");
    showRepoAtThisCommetBtn.className = "show-repo-from-commit-btn btn";
    showRepoAtThisCommetBtn.target = "_blank";
    showRepoAtThisCommetBtn.href = `repoPage.html?repoName=${repoName}&url=${params.repoURL}&treeUrl=${commitTreeUrl}&sha=${sha}`;

    const devIcon = document.createElement("i");
    devIcon.className = "fa-solid fa-code";

    showRepoAtThisCommetBtn.append(devIcon);

    return showRepoAtThisCommetBtn;
  }
}

abstract class CommitLeftSide extends CommitRightSide {
  constructor(protected _copyBtn: GenerateCopyBtnFnType) {
    super(_copyBtn);
  }

  protected _generateCommitLeftSide({
    commit: {
      message,
      committer: { date },
    },
    html_url,
    author: { avatar_url, login },
  }: CommitType) {
    const leftSide = document.createElement("div");
    leftSide.className = "commit-slice-left-side";

    const messageEl = this._commitMsg(message, html_url);
    const author = this._commitAuthor(avatar_url, login, date);

    leftSide.append(messageEl, author);

    return leftSide;
  }

  private _commitMsg(message: string, commitURL: string) {
    const messageEl = document.createElement("a");
    messageEl.className = "commit-message";
    messageEl.href = commitURL;
    messageEl.rel = "nofollow";
    messageEl.target = "_blank";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-arrow-up-right-from-square";

    messageEl.append(message + " ", icon);

    return messageEl;
  }

  private _commitAuthor(avatar_url: string, login: string, date: string) {
    const author = document.createElement("div");
    author.className = "commit-author";

    author.append(
      generateUserAvatar(avatar_url),
      `${login} authored ${formatDistanceToNow(date, {
        addSuffix: true,
      })}`
    );

    return author;
  }
}

abstract class SingleCommitUI extends CommitLeftSide {
  constructor(protected _copyBtn: GenerateCopyBtnFnType) {
    super(_copyBtn);
  }

  protected _generateSingleCommit(commit: CommitType) {
    const commitHolder = document.createElement("li");
    commitHolder.className = "commit";

    const leftSide = this._generateCommitLeftSide(commit);
    const rightSide = this._generateCommitRightSide(commit);

    commitHolder.append(leftSide, rightSide);

    return commitHolder;
  }
}

class CommitsUI extends SingleCommitUI {
  constructor(protected _copyBtn: GenerateCopyBtnFnType) {
    super(_copyBtn);
    this._renderCommits();
  }

  private async _renderCommits() {
    const commits = await this._getCommits();

    const sortedCommits = this._sortCommitsByDate(commits);

    const commitsByDateUI = Object.entries(sortedCommits).map((commitsInfo) =>
      this._generateGroupOfCommitsByDate(...commitsInfo)
    );

    document.getElementById("commits-holder")?.append(...commitsByDateUI);
  }

  private _generateGroupOfCommitsByDate(date: string, commits: CommitType[]) {
    const holder = document.createElement("div");
    holder.className = "sub-commits-holder";

    const title = document.createElement("h2");
    title.textContent = `Commits on ${date}`;

    const commitsList = document.createElement("ul");
    commitsList.className = "commits-list";

    commitsList.append(...commits.map(this._generateSingleCommit.bind(this)));

    holder.append(title, commitsList);

    return holder;
  }
}

new CommitsUI(new CopyBtn().generateCopyBtn);
