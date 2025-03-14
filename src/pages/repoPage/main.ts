// components
import RepoLanguagesUI from "../../components/repoLanguages/RepoLanguagesUI";
import BtnsSection, {
  type GenerateBtnsSectionFnType,
} from "../../components/btnsSection/BtnsSection";

// utils
import { fetchData, generateUserAvatar } from "../../utils";

// types
import type { CommitType, RepoType, UserType } from "../../types";

type GetTreeFnParams = (
  | {
      treeUrl: string;
      oldPath: string;
    }
  | {
      treeUrl?: never;
      oldPath?: never;
    }
) & {
  username: string;
  repoName: string;
  msgParentEl: HTMLElement;
};

const searchParams = new URLSearchParams(location.search);
const repoURL = searchParams.get("url") || "";
const commitTreeUrl = searchParams.get("treeUrl") || "";
const commitSha = searchParams.get("sha") || "";
console.log(commitSha);

class Repo {
  constructor() {}

  protected async _getRepo() {
    return await fetchData({
      url: repoURL,
      errorMsg: {
        erorrMsgId: "get-single-repo-error-msg",
        errorMsg: "can't get this repo at the momment",
        errorMsgParent: document.querySelector("main")!,
      },
      loadingMsg: {
        loadingMsgId: "get-single-repo-loading-msg",
        loadingMsgParent: document.querySelector("main")!,
      },
    });
  }
}

class ReposLeftSide {
  constructor() {}

  protected async _getTree({
    treeUrl,
    msgParentEl,
    username,
    repoName,
  }: GetTreeFnParams) {
    if (treeUrl || commitTreeUrl) {
      return (
        await fetchData({
          url: treeUrl || commitTreeUrl,
          loadingMsg: {
            loadingMsgId: "tree-loading-msg",
            loadingMsgParent: msgParentEl,
            loadingMsg: "Loading files tree...",
          },
          errorMsg: {
            erorrMsgId: "tree-error-msg",
            errorMsgParent: msgParentEl,
            errorMsg: "can't git files of this folder",
          },
        })
      ).tree;
    }

    const latestCommitInMainBranch = (await fetchData({
      url: `https://api.github.com/repos/${username}/${repoName}/commits/main`,
      loadingMsg: {
        loadingMsgId: "tree-loading-msg",
        loadingMsgParent: msgParentEl,
        loadingMsg: "Loading tree files...",
      },
      errorMsg: {
        erorrMsgId: "tree-loading-msg",
        errorMsgParent: msgParentEl,
        errorMsg: "can't get this tree files",
      },
    })) as CommitType;

    const mainBranchTree = await fetchData({
      url: latestCommitInMainBranch.commit.tree.url,
      loadingMsg: {
        loadingMsgId: "tree-loading-msg",
        loadingMsgParent: msgParentEl!,
        loadingMsg: "Loading tree files...",
      },
      errorMsg: {
        erorrMsgId: "tree-error-msg",
        errorMsgParent: msgParentEl!,
        errorMsg: "can't git files of this folder",
      },
    });

    return mainBranchTree.tree;
  }
}

class RepoLeftSideUI extends ReposLeftSide {
  constructor() {
    super();
  }

  public _renderLeftSideContent({
    owner: { avatar_url, login },
    name,
  }: RepoType) {
    const ownerSection = this._ownerSection({
      avatar_url,
      login,
    });

    const treeSection = this._renderTree({ username: login, repoName: name });

    document.getElementById("left-side")?.append(ownerSection, treeSection);
  }

  private _renderTree(params: Omit<GetTreeFnParams, "msgParentEl">) {
    const treeList = document.createElement("ul");
    treeList.className = "tree-list";

    this._getTree({ ...params, msgParentEl: treeList } as GetTreeFnParams).then(
      (data) => {
        data.forEach(({ path, url, type }: Record<string, string>) => {
          const treeItem = document.createElement("li");

          let btn: HTMLButtonElement | HTMLAnchorElement;

          const icon = document.createElement("i");

          if (type === "blob") {
            btn = document.createElement("a");
            btn.href = `renderBlobPage.html?repoName=${`${params.username}/${params.repoName}`}&fileName=${
              (params.oldPath ? `${params.oldPath}/` : "") + path
            }&url=${url}&repoURL=${repoURL}&treeUrl=${commitTreeUrl}`;
            btn.target = "_blank";
            btn.rel = "nofollow";

            icon.className = "fa-regular fa-file";
          } else {
            btn = document.createElement("button");
            icon.className = "fa-solid fa-folder-closed";

            let tree: HTMLUListElement;
            btn.onclick = async () => {
              icon!.classList.toggle("fa-folder-open");
              icon!.classList.toggle("fa-folder-closed");

              if (!tree) {
                tree = this._renderTree({
                  ...params,
                  treeUrl: url,
                  msgParentEl: treeItem,
                  oldPath: `${
                    params.oldPath ? `${params.oldPath}/` : ""
                  }${path}`,
                } as GetTreeFnParams) as typeof tree;
              }

              if (icon.classList.contains("fa-folder-open")) {
                treeItem.append(tree);
              } else {
                treeItem.querySelector(".tree-list")?.remove();
              }
            };
          }

          btn.append(icon, path);
          treeItem.append(btn);
          treeList.append(treeItem);
        });
      }
    );

    return treeList;
  }

  private _ownerSection({
    avatar_url,
    login,
  }: Pick<UserType, "avatar_url" | "login">) {
    const holder = document.createElement("div");
    holder.id = "author-section";

    const authorInfoHolder = document.createElement("div");
    authorInfoHolder.id = "author-info-holder";
    authorInfoHolder.append(generateUserAvatar(avatar_url), login);

    holder.append(authorInfoHolder);

    if (commitSha) {
      const sha = document.createElement("p");
      sha.id = "sha-content";
      sha.textContent = commitSha.slice(0, 6);

      holder.append(sha);
    }

    return holder;
  }
}

class RepoRigthtSideUI extends RepoLanguagesUI {
  constructor(protected _btnsSection: GenerateBtnsSectionFnType) {
    super();
  }

  public _renderRightSideContent({
    html_url,
    ssh_url,
    clone_url,
    description,
    default_branch,
    watchers_count,
    homepage,
    languages_url,
    created_at,
    commits_url,
    full_name,
    url,
  }: RepoType) {
    const btnsSection = this._btnsSection(
      html_url,
      clone_url,
      ssh_url,
      "repo-btns-section"
    );

    const descriptionSection = description
      ? this._descriptionSection(description)
      : document.createDocumentFragment();

    const homepageUrlSection = this._homepageUrlSection(homepage);
    const defaultBranchSectionSection =
      this._defaultBranchSection(default_branch);

    const commitsSection = this._CommitsRedirectBtns({
      commitsURL: commits_url,
      repoURL: url,
      repoName: full_name,
    });
    const viewsCountSection = this._viewsCountSection(watchers_count);
    const languagesSection = languages_url
      ? this._generateLanguages(languages_url)
      : document.createDocumentFragment();
    const createdAtSection = this._createdAtSection(created_at);

    document
      .getElementById("right-side")
      ?.append(
        btnsSection,
        descriptionSection,
        homepageUrlSection,
        commitsSection,
        defaultBranchSectionSection,
        viewsCountSection,
        languagesSection,
        createdAtSection
      );
  }

  private _CommitsRedirectBtns({
    commitsURL,
    repoURL,
    repoName,
  }: Record<"commitsURL" | "repoURL" | "repoName", string>) {
    const holder = document.createElement("div");
    holder.id = "commits-redirect";
    holder.className = "url-holder";

    const link = document.createElement("a");
    link.href = `commitsPage.html?repoName=${repoName}&repoURL=${repoURL}&url=${commitsURL}`;
    link.target = "_blank";
    link.textContent = "commits";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-clock";

    holder.append(icon, link);

    return holder;
  }

  private _descriptionSection(description: string) {
    const discriptionHolder = document.createElement("div");
    discriptionHolder.id = "description-section";

    const descriptionSectionTitle = document.createElement("h2");
    descriptionSectionTitle.textContent = "Description";

    const descriptionEl = document.createElement("p");
    descriptionEl.textContent = description;

    discriptionHolder.append(descriptionSectionTitle, descriptionEl);

    return discriptionHolder;
  }

  private _homepageUrlSection(homepageUrl: string) {
    if (!homepageUrl) return document.createDocumentFragment();

    const discriptionHolder = document.createElement("div");
    discriptionHolder.id = "project-home-page-link-section";
    discriptionHolder.className = "url-holder";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-link";

    const linkEl = document.createElement("a");
    linkEl.href = homepageUrl;
    linkEl.rel = "nofollow";
    linkEl.target = "_blank";
    linkEl.textContent = homepageUrl;

    discriptionHolder.append(icon, linkEl);

    return discriptionHolder;
  }

  private _defaultBranchSection(default_branch: string) {
    const mainBranchSection = document.createElement("div");
    mainBranchSection.id = "main-branch-section";

    const mainBranchTitle = document.createElement("h2");
    mainBranchTitle.textContent = "Main Branch";

    const branchSectionContent = document.createElement("p");

    const branchIcon = document.createElement("i");
    branchIcon.className = "fa-solid fa-code-branch";

    branchSectionContent.append(branchIcon, default_branch);

    mainBranchSection.append(mainBranchTitle, branchSectionContent);

    return mainBranchSection;
  }

  private _viewsCountSection(watchers_count: number) {
    const viewsCountSection = document.createElement("div");
    viewsCountSection.id = "views-section";

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = "Views";

    const sectionContent = document.createElement("p");

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-eye";

    sectionContent.append(icon, watchers_count.toString());

    viewsCountSection.append(sectionTitle, sectionContent);

    return viewsCountSection;
  }

  private _createdAtSection(created_at: string) {
    const holder = document.createElement("p");
    holder.id = "repo-date";

    holder.textContent = `created at: ${new Date(created_at).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    )}`;

    return holder;
  }
}

class RepoUI extends Repo {
  constructor(generateMethods: ((repo: RepoType) => void)[]) {
    super();
    this._renderRepoInfo(generateMethods);
  }

  private async _renderRepoInfo(generateMethods: ((repo: RepoType) => void)[]) {
    const repo = (await this._getRepo()) as RepoType;

    generateMethods.forEach((method) => method(repo));
  }
}

const rightSideContent = new RepoRigthtSideUI(
  new BtnsSection().generateBtnsSection.bind(new BtnsSection())
);
const leftSideContent = new RepoLeftSideUI();

new RepoUI([
  rightSideContent._renderRightSideContent.bind(rightSideContent),
  leftSideContent._renderLeftSideContent.bind(leftSideContent),
]);
