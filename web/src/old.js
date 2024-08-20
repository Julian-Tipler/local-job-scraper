function testGet() {
  const mockEvent = {
    parameter: {
      experienceInputs: encodeURIComponent(
        JSON.stringify([
          [
            "Created an API that converts web-scraped data into embeddings. This allows us to use RAG, accelerating data retrieval by 80-90__PERCENT__ compared to traditional data search methods.",
            "Engineered a scalable backend API that scans websites with 1000+ pages using Node.js and TypeScript, integrating OpenAI’s LLM and Stripe payment processing.",
            "Led development of a chatbot generator that builds generative AI assistants in under 15 seconds.",
          ],
          [
            "Custom built our website-wide file uploader, drawer, and horizontal card components alongside 30 feature-specific components for our design system using JavaScript, TypeScript, React, and SCSS.",
            "Further increased mastery of several modern frontend tools including React Functional Components, Hooks, React Router, and Redux.",
            "Designed and built our Points API with Node.js and Ruby on Rails, enabling users to reward each other with points redeemable for prizes. Scaled backend to handle over 35,000 daily transactions.",
            "Architected and developed our Node.js/Bull email notification system for platform admin, scaled to serve companies with 20,000+ people.",
          ],
          ["Python", "SQL", "JavaScript"],
          [
            "Redux",
            "Apollo",
            "GraphQL",
            "Ruby on Rails",
            "Express",
            "Postgres",
            "MongoDB",
            "Firebase",
            "Supabase",
            "CI/CD",
            "AWS",
            "GCP",
            "Jest",
            "Rspec",
            "UI/UX",
            "GitHub",
          ],
        ])
      ),
    },
  };

  // Call the doGet function with the mock event
  const result = doGet(mockEvent);

  // Log the result to the Apps Script Logs
  Logger.log(result.getContent());
}

function doGet(e) {
  const experienceInputs = e.parameter.experienceInputs;
  const decodedExperienceInputs = JSON.parse(
    decodeURIComponent(experienceInputs).replace(/__PERCENT__/g, "%")
  );

  const templateId = "1H1MpOYYlxojDFUod2h7r3B_AyLTcburPu8JcyxJWu8E";
  // Make a copy of the template
  const copiedDoc = DriveApp.getFileById(templateId).makeCopy();
  const copiedDocId = copiedDoc.getId();

  copiedDoc.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.EDIT
  );

  // Open the copied document
  const doc = DocumentApp.openById(copiedDocId);
  const body = doc.getBody();

  const placholders = ["::0::", "::1::", "::2::", "::3::"];
  let placeholderIndex = 0;
  let numChildren = body.getNumChildren();
  for (let c = 0; c < numChildren; c++) {
    Logger.log(numChildren);
    var child = body.getChild(c);

    if (
      child.asText().getText() === placholders[placeholderIndex] &&
      [0, 1].includes(placeholderIndex)
    ) {
      child.clear();

      let experienceInput = decodedExperienceInputs[placeholderIndex];

      for (let j = 0; j < experienceInput.length; j++) {
        const listItem = body
          .insertListItem(c, experienceInput[j])
          .setGlyphType(DocumentApp.GlyphType.BULLET);
        const textStyle = listItem.editAsText();
        textStyle.setFontSize(11).setBold(false).setFontFamily("Inter;300");
        c++;
        numChildren++;
      }
      placeholderIndex++;
    } else if (
      child.asText().getText().includes(placholders[placeholderIndex]) &&
      [2, 3].includes(placeholderIndex)
    ) {
      child.clear();
      const prefix = placeholderIndex === 2 ? "Languages: " : "Technologies: ";
      const paragraph = body.insertParagraph(
        c,
        `${prefix}${decodedExperienceInputs[placeholderIndex].join(", ")}`
      );
      const textStyle = paragraph.editAsText();
      textStyle.setFontSize(11).setBold(false).setFontFamily("Inter;300");
      textStyle.setBold(0, prefix.length - 1, true);
      paragraph.setSpacingAfter(0);
      c++;
      numChildren++;
      placeholderIndex++;
    }
  }

  // Save and close the document
  doc.saveAndClose();

  const url =
    "https://docs.google.com/feeds/download/documents/export/Export?id=" +
    copiedDocId +
    "&exportFormat=pdf";

  // Fetch the PDF
  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken(),
    },
  });

  // Create a file in Google Drive with the PDF content
  const blob = response.getBlob().setName("Resume.pdf");
  const file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Get the URL of the created file
  const pdfUrl = file.getUrl();
  const docUrl = copiedDoc.getUrl();

  const result = {
    pdfUrl: pdfUrl,
    docUrl: docUrl,
  };

  // Return the URLs as a JSON string
  return ContentService.createTextOutput(JSON.stringify(result));
}
