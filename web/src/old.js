function testCloneAndModifyDoc() {
  // Mock the e content
  var mockE = {
    postData: {
      contents: JSON.stringify({
        experienceInputs: [
          ["Wrote some code at WisePilot", "Learned AI stuff"],
          ["Wrote Points API", "Ruby on Rails code"],
          ["Ruby on Rails, Typescript, Javascript"],
          ["React, Next.js, LLMs"],
        ],
      }),
    },
  };

  // Call the function with the mock content
  var result = doPost(mockE);

  // Log the result
  Logger.log(result.getContent());
}

function doPost(e) {
  return ContentService.createTextOutput("hello");

  // var params = JSON.stringify(e);

  // return ContentService.createTextOutput(params)

  // const pdfUrl = cloneAndModifyDoc(e)
  // return ContentService.createTextOutput(pdfUrl)
}

function cloneAndModifyDoc(e) {
  const contents = JSON.parse(e.postData.contents);
  const experienceInputs = contents.experienceInputs;

  const templateId = "1H1MpOYYlxojDFUod2h7r3B_AyLTcburPu8JcyxJWu8E";
  // Make a copy of the template
  const copiedDoc = DriveApp.getFileById(templateId).makeCopy();
  const copiedDocId = copiedDoc.getId();

  // Open the copied document
  const doc = DocumentApp.openById(copiedDocId);
  const body = doc.getBody();

  experienceInputs.forEach((experienceInput, i) => {
    const placeholder = `::${i}::`;
    const output =
      i < 2
        ? experienceInput.map((item) => `• ${item}`).join("\n")
        : experienceInput.join(", ");
    Logger.log(`Replacing placeholder: ${placeholder} with content: ${output}`);

    // Replace placeholder with the bullet points
    body.replaceText(placeholder, output);
  });

  // Save and close the document
  doc.saveAndClose();

  // Get the URL for downloading the document as a PDF
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

  // Get the URL of the created file
  const pdfUrl = file.getUrl();

  // Return the PDF URL as a JSON response
  return pdfUrl;
}
