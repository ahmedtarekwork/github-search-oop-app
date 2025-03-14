// components
import CopyBtn, {
  type GenerateCopyBtnFnType,
} from "../../components/copyBtn/CopyBtn";

import { fetchData } from "../../utils";
import languages from "language-map";

abstract class Methods {
  private _URLParams: URLSearchParams;

  protected _fileExtension: string;
  protected _filePath: string;

  private _blobURL: string;
  private _repoFullName: string;

  constructor() {
    this._URLParams = new URLSearchParams(location.search);
    this._filePath = this._URLParams.get("fileName") || "";
    this._blobURL = this._URLParams.get("url") || "";
    this._repoFullName = this._URLParams.get("repoName") || "";

    this._fileExtension = this._filePath
      .toLowerCase()
      .substring(this._filePath.lastIndexOf("."));
  }

  protected async _getVideoBlobInfo() {
    return await fetchData({
      url: `https://api.github.com/repos/${this._repoFullName}/contents/${this._filePath}`,
      errorMsg: {
        errorMsgParent: document.querySelector("main")!,
        erorrMsgId: "get-blob-content-error-msg",
        errorMsg: "can't get this video at the momment",
      },
      loadingMsg: {
        loadingMsgParent: document.querySelector("main")!,
        loadingMsgId: "get-blob-content-loading-msg",
      },
    });
  }

  protected _getLanguageFromFileExtension() {
    const extendedLanguages = {
      ...languages,
      TypeScript: {
        extensions: [".ts", ".tsx"],
      },
    };

    for (const [language, details] of Object.entries(extendedLanguages)) {
      const extensions = (details: any): string[] =>
        details && Array.isArray(details.extensions) ? details.extensions : [];

      if (extensions(details).includes(this._fileExtension)) {
        return language.toLowerCase();
      }
    }
    return "plaintext";
  }

  protected async _getBlobContent() {
    return await fetchData({
      url: this._blobURL,
      errorMsg: {
        errorMsgParent: document.querySelector("main")!,
        erorrMsgId: "get-blob-content-error-msg",
        errorMsg: "can't get this file at the momment",
      },
      loadingMsg: {
        loadingMsgParent: document.querySelector("main")!,
        loadingMsgId: "get-blob-content-loading-msg",
      },
    });
  }
}

class UI extends Methods {
  constructor(private _copyBtn: GenerateCopyBtnFnType) {
    super();
    this._renderFileContent();
  }

  private async _renderFileContent() {
    const videoPreview = await this._generateVideoPreview();
    if (videoPreview) return;

    const blobData = await this._getBlobContent();

    const content = blobData?.content || "";
    const encoding = blobData?.encoding || "";

    const imgPreview = this._generateImgPreview(encoding, content);

    if (imgPreview) return;

    this._generateTextContent(content);
  }

  private async _generateVideoPreview() {
    const videoFormats = [
      "3gp",
      "3g2",
      "mp4",
      "webm",
      "ogg",
      "ogv",
      "mov",
      "avi",
      "mkv",
      "mpeg",
      "mpg",
      "flv",
      "wmv",
      "m4v",
      "asf",
      "divx",
      "f4v",
      "m2v",
      "mpe",
      "vob",
      "rm",
      "rmvb",
      "swf",
      "qt",
      "avchd",
    ];

    if (!videoFormats.includes(this._fileExtension.replace(".", ""))) return;

    const videoInfo = await this._getVideoBlobInfo();
    if (videoInfo.type !== "file" || !videoInfo.download_url) return;

    const videoEl = document.createElement("video");

    videoEl.src = videoInfo.download_url;
    videoEl.controls = true;
    videoEl.style.maxWidth = "100%";

    const downloadVideoBtn = document.createElement("a");
    downloadVideoBtn.href = videoInfo.download_url;
    downloadVideoBtn.target = "_blank";
    downloadVideoBtn.rel = "nofollow";
    downloadVideoBtn.className = "download-video-btn btn";

    const downloadIcon = document.createElement("i");
    downloadIcon.className = "fa-solid fa-file-arrow-down";

    downloadVideoBtn.append(downloadIcon, "Download Video");

    document.querySelector("main")?.append(videoEl, downloadVideoBtn);

    return true;
  }

  private _generateImgPreview(encoding: string, content: string) {
    if (encoding === "base64") {
      const imageExtensions = [
        { extension: ".jpg", mimeType: "" },
        { extension: ".jpeg", mimeType: "" },
        { extension: ".png", mimeType: "" },
        { extension: ".gif", mimeType: "" },
        { extension: ".webp", mimeType: "" },
        { extension: ".bmp", mimeType: "" },
        { extension: ".svg", mimeType: "image/svg+xml" },
        { extension: ".ico", mimeType: "image/x-icon" },
        { extension: ".tiff", mimeType: "image/tiff" },
        { extension: ".tif", mimeType: "image/tiff" },
        { extension: ".avif", mimeType: "image/avif" },
        { extension: ".apng", mimeType: "image/apng" },
        { extension: ".jxl", mimeType: "image/jxl" },
      ].map((ext) => ({
        ...ext,
        mimeType: ext.mimeType || `image/${this._filePath.split(".").pop()}`,
      }));

      const isImg = imageExtensions.find(
        ({ extension }) => this._fileExtension === extension
      );

      if (isImg) {
        const img = document.createElement("img");
        img.src = `data:${isImg.mimeType};base64,${content}`;
        img.alt = "image";

        document.querySelector("main")!.appendChild(img);
        return true;
      }
    }
  }

  private _generateTextContent(content: string) {
    const decodedContent = atob(content);

    const pre = document.createElement("pre");
    pre.className = "hljs";

    const header = document.createElement("div");
    header.className = "hljs";
    header.id = "code-header";

    const fileName = document.createElement("p");

    const fileIcon = document.createElement("i");
    fileIcon.className = "fa-solid fa-file";

    fileName.append(fileIcon, this._filePath);

    header.append(
      fileName,
      this._copyBtn({
        btnContent: "copy",
        className: "copy-code-btn",
        copyContent: decodedContent,
      })
    );

    const secondaryHolder = document.createElement("div");
    secondaryHolder.id = "secondary-holder";

    const lineNumbers = this._generateLineNumbers(decodedContent);

    const codeEl = document.createElement("code");

    codeEl.className = `hljs language-${this._getLanguageFromFileExtension()}`;
    codeEl.textContent = decodedContent;

    const hljs = (window as unknown as { hljs: any }).hljs;
    hljs?.highlightElement(codeEl);

    secondaryHolder.append(
      lineNumbers,
      codeEl
      // this._copyBtn({
      //   btnContent: "copy",
      //   className: "copy-code-btn",
      //   copyContent: decodedContent,
      // })
    );

    pre.append(secondaryHolder);

    document.querySelector("main")!.append(header, pre);
  }

  private _generateLineNumbers(decodedContent: string) {
    const lineNumbers = document.createElement("ul");
    lineNumbers.id = "line-numbers";

    const lines = Array.from({ length: decodedContent.split("\n").length }).map(
      (_, i) => {
        const lineNumber = document.createElement("li");
        lineNumber.textContent = i.toString();

        return lineNumber;
      }
    );

    lineNumbers.append(...lines);

    return lineNumbers;
  }
}

new UI(new CopyBtn().generateCopyBtn.bind(new CopyBtn()));
