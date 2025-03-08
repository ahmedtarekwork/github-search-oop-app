type ErrorMsg =
  | {
      showMsg?: never;
      errorMsgParent: HTMLElement;
      erorrMsgId: string;
      errorMsg: string;
    }
  | {
      showMsg: false;
      errorMsgParent?: never;
      erorrMsgId?: never;
      errorMsg?: never;
    };

type FetchDataFnParams = {
  url: string;
  loadingMsg?: {
    loadingMsgParent: HTMLElement;
    loadingMsgId: string;
    loadingMsg?: string;
  };
  errorMsg?: {
    callback?: () => void;
  } & ErrorMsg;
};

type ShowMsgFnParams =
  | {
      show: true;
      id: string;
      parentEl: HTMLElement | null;
      className: string;
      msg: string;
    }
  | {
      show: false;
      id: string;
      parentEl?: never;
      className?: never;
      msg?: never;
    };

export const showMsg = ({
  id,
  show,
  className,
  msg,
  parentEl,
}: ShowMsgFnParams) => {
  const MsgEl = document.getElementById(id);

  if (show) {
    if (MsgEl) return;

    const msgHolder = document.createElement("p");
    msgHolder.className = className;
    msgHolder.textContent = msg;
    msgHolder.id = id;

    parentEl?.append(msgHolder);

    return;
  }

  MsgEl?.remove();
};

export const fetchData = async ({
  url,
  loadingMsg,
  errorMsg,
}: FetchDataFnParams) => {
  if (loadingMsg) {
    const { loadingMsgParent, loadingMsgId, loadingMsg: content } = loadingMsg;
    showMsg({
      show: true,
      parentEl: loadingMsgParent,
      id: loadingMsgId,
      className: "loading-msg-holder",
      msg: content || "Loading...",
    });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();

    const data = await res.json();
    if ("message" in data) throw new Error();

    return data;
  } catch (error) {
    if (errorMsg) {
      const {
        showMsg = true,
        erorrMsgId,
        errorMsg: content,
        errorMsgParent,
        callback,
      } = errorMsg;

      if (showMsg) {
        const errorMsgEl = document.createElement("p");
        errorMsgEl.className = "error-msg";
        errorMsgEl.id = erorrMsgId!;
        errorMsgEl.textContent = content!;

        errorMsgParent!.append(errorMsgEl);
      }

      callback?.();
    }
  } finally {
    if (loadingMsg) {
      showMsg({
        show: false,
        id: loadingMsg.loadingMsgId,
      });
    }
  }
};

export const generateUserAvatar = (
  avatar_url: string,
  imgSize: number = 25
) => {
  if (avatar_url) {
    const authorImg = document.createElement("img");
    authorImg.src = avatar_url;
    authorImg.alt = "author image";
    authorImg.width = imgSize;
    authorImg.height = imgSize;

    return authorImg;
  } else {
    const imgPlaceholder = document.createElement("div");
    imgPlaceholder.style.cssText = `width: ${imgSize}px; height: ${imgSize}px;`;
    imgPlaceholder.className = "user-avatar";

    const userIcon = document.createElement("i");
    userIcon.className = "fa-solid fa-user";
    userIcon.style.cssText = `font-size: ${imgSize * (2 / 3)}px;`;

    imgPlaceholder.append(userIcon);

    return imgPlaceholder;
  }
};
