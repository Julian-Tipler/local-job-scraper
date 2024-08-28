import "./content.css";
console.log("content 🚀");

window.addEventListener("load", () => {
  main();
});

const main = () => {
  const currentJobId = new URLSearchParams(window.location.search).get(
    "currentJobId"
  );

  // Only proceed if currentJobId is present in the URL
  if (currentJobId) {
    // Selectors for job title and description
    const jobTitleElement = document.querySelector(
      ".job-details-jobs-unified-top-card__job-title"
    );
    const jobDescriptionElement = document.querySelector(
      ".job-details-module__content"
    );
    const containerElement = document.querySelector(
      ".job-details-jobs-unified-top-card__container--two-pane"
    );

    if (jobTitleElement && jobDescriptionElement && containerElement) {
      const jobTitle = jobTitleElement.innerText.trim();
      const jobDescription = jobDescriptionElement.innerText.trim();
      const currentPageUrl = window.location.href;

      // Create a button element
      const button = document.createElement("button");
      button.innerText = "Go to Create Page";
      button.style.padding = "10px";
      button.style.marginTop = "10px";
      button.style.backgroundColor = "#0073b1";
      button.style.color = "white";
      button.style.border = "none";
      button.style.cursor = "pointer";

      // Add the button after the container element
      containerElement.appendChild(button);

      // Add a click event listener to the button
      button.addEventListener("click", () => {
        const urlParams = new URLSearchParams({
          title: jobTitle,
          description: jobDescription,
          url: currentPageUrl,
        });

        const redirectUrl = `http://localhost:5174/create?${urlParams.toString()}`;
        window.location.href = redirectUrl;
      });
    }
  }
};
