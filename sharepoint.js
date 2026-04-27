// ==============================
// KONFIGURATION — hier anpassen
// ==============================
const MSAL_CONFIG = {
  auth: {
    clientId: "4eed9e38-1449-40e6-8401-65da4ba5d8f1",       // aus Schritt 1
    authority: "https://login.microsoftonline.com/74149779-0882-42d4-a001-eee89391dd43",
    redirectUri: "https://marceldiller.github.io/PWA_test/"
  }
};

const SHAREPOINT = {
  siteId: "DEINE_SITE_ID",    // siehe unten wie du das findest
  driveId: "DEINE_DRIVE_ID",  // die Document Library
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
  const token = await getToken();
  // filename direkt verwenden — kommt fertig aus Main.html
  const url = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT.siteId}/drives/${SHAREPOINT.driveId}/root:/Uploads/${filename}:/content`;
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": file.type },
    body: file
  });
  if (!response.ok) throw new Error(response.statusText);
}
