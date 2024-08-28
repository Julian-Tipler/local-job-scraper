export const renderShadow = async () => {
  const sRoot = document.createElement("div");
  sRoot.id = "wise-flashcards-content-container";

  const shadowRoot = sRoot.attachShadow({ mode: "closed" });
  // shadowRoot.innerHTML  = `<style>:host {all: initial;}</style>`;

  const cssFiles = await Promise.all([loadCss("content/content.css")]);

  cssFiles.forEach((css) => {
    const style = document.createElement("style");
    style.textContent = css;
    shadowRoot.appendChild(style);
  });
};

async function loadCss(filePath) {
  const response = await fetch(chrome.runtime.getURL(filePath));
  return response.text();
}
