import "./style.css";

import CopyBtn from "../copyBtn/CopyBtn";

export type GenerateBtnsSectionFnType = (
  html_url: string,
  clone_url: string,
  ssh_url: string,
  className: string
) => HTMLUListElement;

export default class extends CopyBtn {
  constructor() {
    super();
  }

  public generateBtnsSection(
    html_url: string,
    clone_url: string,
    ssh_url: string,
    className: string
  ) {
    const btnsHolder = document.createElement("ul");
    btnsHolder.className = `btns-holder${className ? ` ${className}` : ""}`;

    const showInGithubBtn = this._showInGithubBtn(html_url);
    const cloneRepoBtns = this._copyRepoBtns(clone_url, ssh_url);

    btnsHolder.append(showInGithubBtn, ...cloneRepoBtns);

    return btnsHolder;
  }

  private _showInGithubBtn(html_url: string) {
    const listItem = document.createElement("li");

    const showInGithubBtn = document.createElement("a");
    showInGithubBtn.href = html_url;
    showInGithubBtn.rel = "nofollow";
    showInGithubBtn.target = "_blank";
    showInGithubBtn.className = "btn";

    const redirectIcon = document.createElement("i");
    redirectIcon.className = "fa-solid fa-arrow-up-right-from-square";

    showInGithubBtn.append("see in github", redirectIcon);

    listItem.append(showInGithubBtn);

    return listItem;
  }

  private _copyRepoBtns(clone_url: string, ssh_url: string) {
    const copyBtn = this.generateCopyBtn.bind(this);

    const cloneRepoBtns = [
      {
        url: clone_url,
        btnContent: "clone url",
        className: "clone-repo-url-btn",
      },
      {
        url: ssh_url,
        btnContent: "ssh url",
        className: "ssh-url-btn",
      },
    ].map(({ btnContent, className, url }) => {
      const listItme = document.createElement("li");
      listItme.append(
        copyBtn({
          btnContent,
          className,
          copyContent: url,
        })
      );

      return listItme;
    });

    return cloneRepoBtns;
  }
}
