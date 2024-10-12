export const renderButton = () => {
  const button = document.createElement("button");
  button.className = "local-job-scraper-button local-job-scraper-button-hidden";
  button.innerHTML += "+ Resume";
  return button;
};
