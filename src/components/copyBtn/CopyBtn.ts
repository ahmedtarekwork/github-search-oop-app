import "./style.css";

type ParamsType = Record<"btnContent" | "className" | "copyContent", string>;

export type GenerateCopyBtnFnType = (params: ParamsType) => HTMLButtonElement;

export default class CopyBtn {
  private _timeouts: Map<HTMLButtonElement, ReturnType<typeof setTimeout>>;
  constructor() {
    this._timeouts = new Map();
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
    const existingTimeout = this._timeouts.get(btn);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this._timeouts.delete(btn);
    }

    const icon =
      btn.querySelector(".fa-clipboard") ||
      btn.querySelector(".fa-clipboard-check");

    try {
      await navigator.clipboard.writeText(copyContent);

      icon!.className = "fa-solid fa-clipboard-check";

      const newTimeout = setTimeout(() => {
        icon!.className = "fa-solid fa-clipboard";
        this._timeouts.delete(btn);
      }, 2500);

      this._timeouts.set(btn, newTimeout);
    } catch (_) {}
  }
}
