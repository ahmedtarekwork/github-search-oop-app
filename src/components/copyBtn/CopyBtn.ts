import "./style.css";

type ParamsType = Record<"btnContent" | "className" | "copyContent", string>;

export type GenerateCopyBtnFnType = (params: ParamsType) => HTMLButtonElement;

export default class CopyBtn {
  private _timeOut: ReturnType<typeof setTimeout>;
  constructor() {
    this._timeOut = 0;
  }

  public generateCopyBtn({ btnContent, className, copyContent }: ParamsType) {
    const btn = document.createElement("button");
    btn.className = `${
      className ? `${className} ` : ""
    } btn copy-to-clipboard-btn`;

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-clipboard";

    btn.append(icon, btnContent);

    btn.onclick = () => this._handleClick(btn, copyContent);

    return btn;
  }

  private async _handleClick(btn: HTMLButtonElement, copyContent: string) {
    clearTimeout(this._timeOut);

    const icon =
      btn.querySelector(".fa-clipboard") ||
      btn.querySelector(".fa-clipboard-check");

    if (icon) icon.className = "fa-solid fa-clipboard";

    try {
      await navigator.clipboard.writeText(copyContent);

      icon!.className = "fa-solid fa-clipboard-check";

      this._timeOut = setTimeout(
        () => (icon!.className = "fa-solid fa-clipboard"),
        2500
      );
    } catch (_) {}
  }
}
