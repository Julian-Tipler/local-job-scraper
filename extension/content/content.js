import "./content.css";
import { handleScrapeAndRedirect } from "./helpers/handle-scrape-and-redirect";
import { observeJobViewLayout } from "./helpers/observe-job-view-layout";
import { renderButton } from "./helpers/render-button";
import { renderShadow } from "./helpers/render-shadow";
console.log("content 👨🏻‍🔧 12");

window.addEventListener("load", async () => {
  await main();
});

const main = async () => {
  const { sContainer, shadowRoot } = await renderShadow();
  const button = renderButton();
  button.addEventListener("click", () => handleScrapeAndRedirect(button));
  observeJobViewLayout();
  shadowRoot.appendChild(button);

  document.body.appendChild(sContainer);
};
