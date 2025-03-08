// components
import RepoLanguagesUI from "../../components/repoLanguages/RepoLanguagesUI";
import BtnsSection, {
  type GenerateBtnsSectionFnType,
} from "../../components/btnsSection/BtnsSection";

// utils
import { fetchData, generateUserAvatar, showMsg } from "../../utils";

// types
import type { RepoType, UserType } from "../../types";

type GetReposParamsType = {
  page: number;
  limit: number;
};

abstract class Repo extends RepoLanguagesUI {
  protected _currentPage: number;
  protected _username: string;
  protected _isLoading: boolean;

  constructor() {
    super();
    this._currentPage = 0;
    this._username = "";
    this._isLoading = false;
  }

  protected async _getRepos({ page, limit }: GetReposParamsType) {
    document.getElementById("get-repos-error-msg")?.remove();

    this._isLoading = true;
    try {
      const data = await fetchData({
        url: `https://api.github.com/users/${this._username}/repos?page=${page}&per_page=${limit}&sort=updated`,
        loadingMsg: {
          loadingMsgId: "show-loading-repo-msg",
          loadingMsgParent: document.getElementById("repos-holder")!,
          loadingMsg: "Loading Repos...",
        },
        errorMsg: {
          erorrMsgId: "get-repos-error-msg",
          errorMsg: "can't get repos at the momment",
          errorMsgParent: document.getElementById("repos-holder")!,
        },
      });

      if (data) this._currentPage++;

      return data;
    } catch (error) {
    } finally {
      this._isLoading = false;
    }
  }
}

class SingleRepoUI extends Repo {
  constructor(protected _btnsSection: GenerateBtnsSectionFnType) {
    super();
  }

  protected _generateSingleRepo({
    name,
    full_name,
    clone_url,
    ssh_url,
    html_url,
    commits_url,
    created_at,
    default_branch,
    languages_url,
    watchers_count,
    id,
    url,
  }: RepoType) {
    const repoHolder = document.createElement("li");
    repoHolder.id = id.toString();

    const repoName = this._repoName(url, full_name, name);
    const repoBtnsHolder = this._btnsSection(
      html_url,
      clone_url,
      ssh_url,
      "clone-repo-btns-holder"
    );
    repoHolder.append(repoName, repoBtnsHolder);

    if (languages_url) {
      const languages = this._generateLanguages(languages_url);

      repoHolder.append(languages);
    }
    const defaultBranch = this._defaultBranch(default_branch);
    const commitsLink = this._commitsLink(commits_url, full_name, url);
    const watchersCount = this._watchersCount(watchers_count);
    const createdAt = this._createdAt(created_at);

    repoHolder.append(defaultBranch, commitsLink, watchersCount, createdAt);

    return repoHolder;
  }

  private _repoName(repoURL: string, full_name: string, name: string) {
    const repoName = document.createElement("h2");
    repoName.className = "repo-name";

    const redirectToRepoPageBtn = document.createElement("a");
    redirectToRepoPageBtn.href = `repoPage.html?url=${repoURL}&repoName=${full_name}`;
    redirectToRepoPageBtn.target = "_blank";
    redirectToRepoPageBtn.textContent = name;

    repoName.append(redirectToRepoPageBtn);

    return repoName;
  }

  private _defaultBranch(default_branch: string) {
    const defaultBranch = document.createElement("p");
    defaultBranch.className = "repo-default-branch";

    const branchIcon = document.createElement("i");
    branchIcon.className = "fa-solid fa-code-branch";

    defaultBranch.append(branchIcon, default_branch);
    return defaultBranch;
  }

  private _commitsLink(
    commits_url: string,
    full_name: string,
    repoURL: string
  ) {
    const holder = document.createElement("div");
    holder.className = "url-holder";

    const commitsLink = document.createElement("a");
    commitsLink.className = "repo-commit-link";
    commitsLink.href = `commitsPage.html?url=${commits_url}&repoName=${full_name}&repoURL=${repoURL}`;
    commitsLink.textContent = "commits";
    commitsLink.target = "_blank";

    const clockIcon = document.createElement("i");
    clockIcon.className = "fa-solid fa-clock";

    holder.append(clockIcon, commitsLink);

    return holder;
  }

  private _watchersCount(watchers_count: number) {
    const watchersCount = document.createElement("p");
    watchersCount.className = "repo-watches-count";

    const eyeIcon = document.createElement("i");
    eyeIcon.className = "fa-solid fa-eye";

    watchersCount.append(eyeIcon, watchers_count.toString());
    return watchersCount;
  }

  private _createdAt(created_at: string) {
    const createdAt = document.createElement("p");
    createdAt.className = "repo-created-at";
    createdAt.textContent = `created at: ${new Date(
      created_at
    ).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;

    return createdAt;
  }
}

abstract class ReposUI extends SingleRepoUI {
  constructor(protected _btnsSection: GenerateBtnsSectionFnType) {
    super(_btnsSection);
    this._handleFetchMoreRepos();
  }

  private _handleFetchMoreRepos() {
    window.onscroll = () => {
      if (
        !this._isLoading &&
        scrollY + innerHeight >= document.documentElement.scrollHeight - 100 &&
        document.getElementById("repos-list")?.children.length
      ) {
        this.renderRepos({ page: this._currentPage + 1, limit: 4 });
      }
    };
  }

  protected async renderRepos(params: GetReposParamsType) {
    const repos = await this._getRepos(params);

    if (!Array.isArray(repos) || !repos?.length) return;

    document
      .getElementById("repos-list")
      ?.append(...repos.map((repo) => this._generateSingleRepo(repo)));
  }
}

abstract class RenderMainProfileInfoUI extends ReposUI {
  constructor(protected _btnsSection: GenerateBtnsSectionFnType) {
    super(_btnsSection);
  }

  protected renderProfileInfo(data: UserType) {
    const reposList = document.getElementById("repos-list");
    if (reposList) reposList.innerHTML = "";

    document.getElementById("get-profile-error")?.remove();

    this.renderRepos({ page: 1, limit: 4 });

    this._generateProfileInfoUI(data);
  }

  private _generateProfileInfoUI({
    avatar_url,
    name,
    html_url,
    login,
    bio,
    blog,
    created_at,
    followers,
    following,
    public_repos,
  }: UserType) {
    const userInfoHolder = document.getElementById("user-info-holder");
    if (!userInfoHolder) return;

    userInfoHolder.innerHTML = "";

    const personInfoHolder = document.createElement("div");
    personInfoHolder.id = "person-info-holder";

    const userImg = generateUserAvatar(avatar_url, 150);

    const nameHolder = document.createElement("div");
    nameHolder.id = "person-name-holder";

    const userRealName = this._userRealName(name);
    const usernameEl = this._generateUsername(login, html_url);

    nameHolder.append(userRealName, usernameEl);

    personInfoHolder.append(userImg, nameHolder);

    const bioHolder = this._bio(bio);
    const blogUrl = this._blog(blog);

    userInfoHolder.append(personInfoHolder, bioHolder, blogUrl);

    const reposCount = this._countSections(
      "user-repos-count",
      "repos",
      public_repos
    );
    const followsCount = this._countSections(
      "user-followers-count",
      "followers",
      followers
    );
    const followingCount = this._countSections(
      "user-following-count",
      "following",
      following
    );

    const createdAt = this._profileCreatedAt(created_at);

    userInfoHolder?.append(reposCount, followsCount, followingCount, createdAt);
  }

  private _userRealName(name: string) {
    const userRealName = document.createElement("p");
    userRealName.id = "user-real-name";
    userRealName.textContent = name;

    return userRealName;
  }

  private _generateUsername(username: string, githubProfileUrl: string) {
    const usernameEl = document.createElement("a");
    usernameEl.id = "user-username";
    usernameEl.className = "btn";
    usernameEl.href = githubProfileUrl;
    usernameEl.target = "_blank";
    usernameEl.rel = "nofollow";

    const redirectIcon = document.createElement("i");
    redirectIcon.className = "fa-solid fa-arrow-up-right-from-square";

    usernameEl.append(username, redirectIcon);

    return usernameEl;
  }

  private _bio(bio: string) {
    const bioHolder = document.createElement("p");
    bioHolder.id = "user-bio";
    bioHolder.textContent = bio;

    return bioHolder;
  }

  private _blog(blog?: string) {
    if (!blog) return document.createDocumentFragment();

    const holder = document.createElement("div");
    holder.className = "url-holder";

    const website = document.createElement("a");
    website.id = "user-blog-url";
    website.href = blog;
    website.target = "_blank";
    website.rel = "nofollow";
    website.textContent = blog;

    const websiteIcon = document.createElement("i");
    websiteIcon.className = "fa-solid fa-globe";

    holder.append(websiteIcon, website);

    return holder;
  }

  private _countSections(id: string, name: string, count: number) {
    const countHolder = document.createElement("p");
    countHolder.id = id;
    countHolder.textContent = `${name}: ${count || 0}`;

    return countHolder;
  }

  private _profileCreatedAt(created_at: string) {
    const createdAt = document.createElement("p");
    createdAt.id = "user-profile-created-at-date";
    createdAt.textContent = new Date(created_at).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return createdAt;
  }
}

class HandleForm extends RenderMainProfileInfoUI {
  constructor(protected _btnsSection: GenerateBtnsSectionFnType) {
    super(_btnsSection);
    this._putEventListenerOnForm();
  }

  private _putEventListenerOnForm() {
    const form = document.querySelector("form")!;
    const handler = this._handleForm.bind(this);

    form.addEventListener("submit", (e) => handler(e));
  }

  private async _handleForm(e: Event) {
    const from = e.currentTarget as HTMLFormElement;

    e.preventDefault();

    const username = from?.username?.value;

    if (!username) {
      return showMsg({
        show: true,
        className: "no-username-error-msg",
        id: "form-error-msg",
        msg: "username must be provided",
        parentEl: document.querySelector("form"),
      });
    } else showMsg({ show: false, id: "form-error-msg" });

    const submitFormBtn = from.querySelector("button") as HTMLButtonElement;

    submitFormBtn.classList.add("disabled");

    try {
      const data = await this._fetchData(username);

      if ("message" in (data || {})) {
        if (document.getElementById("form-error-msg")) {
          document.getElementById("form-error-msg")!.textContent = data.message;
        } else {
          showMsg({
            id: "form-error-msg",
            show: true,
            className: "no-profile-error-msg",
            msg: data.message,
            parentEl: document.querySelector("form"),
          });
        }

        return;
      }

      if (data) {
        this._username = data.login;
        this.renderProfileInfo(data);
      }
    } catch (error) {
    } finally {
      submitFormBtn.classList.remove("disabled");
    }
  }

  private async _fetchData(username: string) {
    return await fetchData({
      url: `https://api.github.com/users/${username}`,
      loadingMsg: {
        loadingMsgParent: document.getElementById("user-info-holder")!,
        loadingMsgId: "show-loading-user-info-msg",
      },
      errorMsg: {
        errorMsg: "can't get this user profile info",
        errorMsgParent: document.querySelector("form")!,
        erorrMsgId: "form-error-msg",
        callback: () => {
          document.getElementById("get-repos-error-msg")?.remove();

          const userInfoHolder = document.getElementById("user-info-holder");
          if (userInfoHolder) userInfoHolder.innerHTML = "";

          const reposList = document.getElementById("repos-list");
          if (reposList) reposList.innerHTML = "";
        },
      },
    });
  }
}

new HandleForm(new BtnsSection().generateBtnsSection.bind(new BtnsSection()));
