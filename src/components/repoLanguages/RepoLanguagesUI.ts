import "./style.css";

import { fetchData } from "../../utils";

abstract class RepoLanguages {
  private _languagesClrs: Record<string, string>[];

  constructor() {
    this._languagesClrs = [];
  }

  protected _getLanguageClr(langName: string) {
    let color: string;

    const oldClr = this._languagesClrs.find(
      (clr) => Object.keys(clr)[0] === langName
    );

    if (oldClr) {
      color = Object.values(oldClr)[0];
    } else {
      color =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");

      this._languagesClrs.push({ [langName]: color });
    }

    return color;
  }

  protected async _getLanguages(languages_url: string) {
    const data = await fetchData({ url: languages_url });

    const totalPercentCount = (Object.values(data) as number[]).reduce(
      (acc, curr) => acc + curr,
      0
    );

    const convertPointsToPercent = Object.entries(data).map(([_key, val]) => {
      return [_key, (((val as number) / totalPercentCount) * 100).toFixed(1)];
    });

    return Object.fromEntries(convertPointsToPercent);
  }
}

export default class RepoLanguagesUI extends RepoLanguages {
  constructor() {
    super();
  }

  protected _generateLanguages(languages_url: string) {
    if (!languages_url) return document.createDocumentFragment();

    const mainHolder = document.createElement("div");
    mainHolder.className = "repo-languages-holder";
    mainHolder.textContent = "Loading...";

    const getLangClr = this._getLanguageClr.bind(this);

    this._getLanguages(languages_url)
      .then((data) => {
        mainHolder.innerHTML = "";

        if (!Object.keys(data).length) return document.createDocumentFragment();

        const colorsBar = this._generateColorsBar(data, getLangClr);
        const langsList = this._generateLanguagesList(data, getLangClr);

        mainHolder.append(colorsBar, langsList);
      })
      .catch(() => (mainHolder.innerHTML = ""));

    return mainHolder;
  }

  private _generateLanguagesList(
    languagesList: Record<string, number>[],
    getLangClr: typeof this._getLanguageClr
  ) {
    const langsList = document.createElement("ul");

    const langItems = Object.entries(languagesList)
      .map(([langName, percent]) => {
        if (!+percent) return;

        let color = getLangClr(langName);

        const langItem = document.createElement("li");
        langItem.className = "repo-lang-item";

        const bollet = document.createElement("div");
        bollet.className = "repo-lang-bollet-clr";
        bollet.style.cssText = `background-color: ${color};`;

        const name = document.createElement("b");
        name.textContent = langName;

        const percentEl = document.createElement("p");
        percentEl.textContent = `${percent}%`;
        percentEl.style.cssText = `color: ${color};`;
        percentEl.className = "lang-percent";

        langItem.append(bollet, name, percentEl);

        return langItem;
      })
      .filter(Boolean) as HTMLLIElement[];

    langsList.append(...langItems);

    return langsList;
  }

  private _generateColorsBar(
    languagesList: Record<string, number>[],
    getLangClr: typeof this._getLanguageClr
  ) {
    const colorsBar = document.createElement("ul");

    Object.entries(languagesList).forEach(([langName, percent]) => {
      let color = getLangClr(langName);

      const colorItem = document.createElement("li");
      colorItem.className = "repo-lang-color-item";
      colorItem.style.cssText += `background-color: ${color}; flex-basis: ${percent}%;`;

      colorsBar.append(colorItem);
    });

    return colorsBar;
  }
}
