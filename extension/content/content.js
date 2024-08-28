import "./content.css";
import { handleScrapeAndRedirect } from "./helpers/handle-scrape-and-redirect";
import { renderButton } from "./helpers/render-button";
import { renderShadow } from "./helpers/render-shadow";
console.log("content 🚀");

window.addEventListener("load", () => {
  main();
});

const main = () => {
  const shadowRoot = renderShadow();
  const button = renderButton();
  shadowRoot.appendChild(button);
  document.body.appendChild(shadowRoot);

  button.addEventListener("click", handleScrapeAndRedirect(button));

  // display the "create resume" button

  // when clicked it should make a supabase call with all the text content which will return the title, url, and description.

  // redirect to localhost with those query parameters
};
