// ==============================
// KONFIGURATION — hier anpassen
// ==============================
const MSAL_CONFIG = {
  auth: {
    clientId: "4eed9e38-1449-40e6-8401-65da4ba5d8f1",       // aus Schritt 1
    authority: "https://login.microsoftonline.com/74149779-0882-42d4-a001-eee89391dd43",
    redirectUri: "https://marceldiller.github.io/PWA_test"
  }
};

const SHAREPOINT = {
  siteId: "veitdennert.sharepoint.com,66d54210-e567-4a1b-b9d3-6731cf68f49f,3ac680c1-4fc0-4b2d-889c-d732e25c4a0b",    // siehe unten wie du das findest
  driveId: "b!EELVZmflG0q502cxz2j0n8GAxjrATy1LiJzXMuJcSgurFC8gbd-dS4-1FyKPwrVR",  // die Document Library
  uploadFolder: "Upload_test" // Ordner in SharePoint
};

const SCOPES = ["Files.ReadWrite", "Sites.ReadWrite.All"];

// ==============================
// MSAL initialisieren
// ==============================
const msalInstance = new msal.PublicClientApplication(MSAL_CONFIG);

async function getToken() {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    // Kein eingeloggter User → Login starten
    await msalInstance.loginPopup({ scopes: SCOPES });
  }
  const result = await msalInstance.acquireTokenSilent({
    scopes: SCOPES,
    account: msalInstance.getAllAccounts()[0]
  });
  return result.accessToken;
}

// ==============================
// Upload-Funktion
// ==============================
async function uploadImageToSharePoint(file, filename) {
  console.log("1. Upload gestartet:", filename);
  
  try {
    const token = await getToken();
    console.log("2. Token erhalten:", token ? "OK" : "LEER");

    const url = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT.siteId}/drives/${SHAREPOINT.driveId}/root:/upload_test/${filename}:/content`;
    console.log("3. URL:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": file.type },
      body: file
    });

    console.log("4. Response Status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text(); // text() statt json() — sicherer
      console.log("5. Fehler Body:", errorBody);
      throw new Error(errorBody);
    }

    console.log("6. Upload erfolgreich!");

  } catch (err) {
    console.log("CATCH Fehler:", err);
    throw err; // wichtig: weiterwerfen damit Main.html es anzeigt
  }
}
