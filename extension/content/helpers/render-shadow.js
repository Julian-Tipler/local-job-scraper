export const renderShadow = async () => {
  const sContainer = document.createElement("div");
  sContainer.id = "local-job-scraper-content-container";

  const shadowRoot = sContainer.attachShadow({ mode: "closed" });
  // shadowRoot.innerHTML  = `<style>:host {all: initial;}</style>`;

  const cssFiles = await Promise.all([loadCss("content/content.css")]);

  cssFiles.forEach((css) => {
    const style = document.createElement("style");
    style.textContent = css;
    shadowRoot.appendChild(style);
  });
  return { sContainer, shadowRoot };
};

async function loadCss(filePath) {
  const response = await fetch(chrome.runtime.getURL(filePath));
  return response.text();
}
