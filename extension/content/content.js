import "./content.css";
import { handleScrapeAndRedirect } from "./helpers/handle-scrape-and-redirect";
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
  shadowRoot.appendChild(button);

  document.body.appendChild(sContainer);


  // display the "create resume" button

  // when clicked it should make a supabase call with all the text content which will return the title, url, and description.

  // redirect to localhost with those query parameters
};
