// /api/sheets.js
import { google } from "googleapis";

export default async function handler(req, res) {
  // --- leer credenciales ---
  try {
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const SHEET_NAME = "Hoja 1";

    if (req.method === "GET") {
      const range = `${SHEET_NAME}!A:H`;
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range,
      });
      const rows = response.data.values || [];
      if (rows.length === 0) return res.status(200).json([]);
      const dataRows = rows.slice(1);
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
      return res.status(200).json(products);
    }

    if (req.method === "PUT") {
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
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: "RAW",
        requestBody: { values },
      });
      return res.status(200).json({ message: "Producto actualizado" });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    console.error("ERROR handler:", err);
    return res.status(500).json({ error: "Error interno" });
  }
}
