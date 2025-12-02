// backend/index.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import { google } from "googleapis";

// Debug:
console.log(">>> GOOGLE_CLIENT_EMAIL:", process.env.GOOGLE_CLIENT_EMAIL);
console.log(">>> GOOGLE_PRIVATE_KEY loaded?:", process.env.GOOGLE_PRIVATE_KEY ? "YES" : "NO");
console.log(">>> GOOGLE_SHEET_ID:", process.env.GOOGLE_SHEET_ID);

// Crear app
const app = express();
app.use(cors());
app.use(express.json());

// ----------- GOOGLE AUTH CONFIG -----------
const serviceAccount = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  token_uri: process.env.GOOGLE_TOKEN_URI,
};

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheetsClient = google.sheets({ version: "v4", auth });

// Nombre de hoja
const SHEET_NAME = "Hoja 1";
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ------------------------------------------------
// GET — Obtener todos los productos
// ------------------------------------------------
app.get("/products", async (req, res) => {
  try {
    const range = `${SHEET_NAME}!A:H`;
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const rows = response.data.values || [];

    if (rows.length === 0) return res.json([]);

    const dataRows = rows.slice(1); // skip header

    const products = dataRows.map((r, i) => ({
      rowIndex: i + 2,
      CODIGO: r[0] || "",
      DESCRIPCION: r[1] || "",
      OFERTA: r[2] || "",
      GRAMAJE: r[3] || "",
      SUCURSALES: r[4] || "",
      VIGENCIA: r[5] || "",
      ULTIMA_EDICION: r[6] || "",
      VARIEDAD: r[7] || "",
    }));

    res.json(products);
  } catch (err) {
    console.error("❌ Error leyendo el Sheet:", err);
    res.status(500).json({ error: "No se pudieron obtener datos" });
  }
});

// ------------------------------------------------
// PUT — Actualizar un producto puntual
// ------------------------------------------------
app.put("/products/update", async (req, res) => {
  try {
    const { rowIndex, updatedData, editorSucursal } = req.body;

    if (!rowIndex || !updatedData || !editorSucursal) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const timestamp = new Date().toLocaleString("es-AR", { hour12: false });

    const values = [
      [
        updatedData.CODIGO || "",
        updatedData.DESCRIPCION || "",
        updatedData.OFERTA || "",
        updatedData.GRAMAJE || "",
        updatedData.SUCURSALES || "",
        updatedData.VIGENCIA || "",
        `${editorSucursal} - ${timestamp}`,
        updatedData.VARIEDAD || "",
      ],
    ];

    const range = `${SHEET_NAME}!A${rowIndex}:H${rowIndex}`;

    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.json({ message: "Producto actualizado" });
  } catch (error) {
    console.error("❌ Error actualizando:", error);
    res.status(500).json({ error: "Error actualizando producto" });
  }
});

// ------------------------------------------------
// SERVIDOR
// ------------------------------------------------
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en PORT ${PORT}`);
});
