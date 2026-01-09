import React, { useEffect, useRef, useState } from "react";
import { fetchProducts, updateProduct, uploadCSV } from "../api";
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import "../App.css";

export default function ProductList() {
  // Inicializar productos desde LocalStorage si existen
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("carteleria_queue");
    return saved ? JSON.parse(saved) : [];
  });

  const [editMode, setEditMode] = useState(null); // Almacena _uniqueId
  const [dropdownOpen, setDropdownOpen] = useState(null); // Almacena _uniqueId
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState(""); // TextArea input
  const [foundProducts, setFoundProducts] = useState([]); // Array de encontrados
  const [notFoundCodes, setNotFoundCodes] = useState([]); // Códigos no encontrados
  const [isSearching, setIsSearching] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // PASSWORD MODAL STATE
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // "CSV" or "CLEAR"

  // Guardar en LocalStorage cada vez que cambia products
  useEffect(() => {
    localStorage.setItem("carteleria_queue", JSON.stringify(products));
  }, [products]);

  // Solo permitir editar: codigo, sucursales, gramaje, oferta, variedad, vigencia, promocion
  const editableFields = ["codigo", "sucursales", "gramaje", "oferta", "variedad", "vigencia", "promocion"];

  function handleUpdate(uniqueId, field, value) {
    setProducts((prev) =>
      prev.map((p) => (p._uniqueId === uniqueId ? { ...p, [field]: value } : p))
    );
  }

  function toggleEditMode(uniqueId) {
    if (editMode === uniqueId) {
      setEditMode(null);
    } else {
      setEditMode(uniqueId);
    }
  }

  async function saveChanges(uniqueId) {
    const product = products.find((p) => p._uniqueId === uniqueId);
    if (!product) return;

    // Si no tiene ID de Firestore, es un producto solo local (recién cargado de CSV)
    if (!product.id) {
      setSnackbar({ open: true, message: "Cambio guardado localmente (Producto nuevo sin sincronizar)", severity: "success" });
      setEditMode(null);
      setDropdownOpen(null);
      return;
    }

    try {
      // Actualizamos en Firestore usando el ID real
      await updateProduct(product.id, product);
      setSnackbar({ open: true, message: "Cambios guardados correctamente", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error al guardar en BD", severity: "error" });
    }

    setEditMode(null);
    setDropdownOpen(null);
  }

  // BUSQUEDA MASIVA
  async function handleBulkSearch() {
    if (!searchQuery.trim()) {
      setSnackbar({ open: true, message: "Ingresá al menos un código", severity: "warning" });
      return;
    }

    setIsSearching(true);
    setFoundProducts([]);
    setNotFoundCodes([]);

    try {
      // 1. Obtener TODOS los productos de Firestore (una sola vez)
      const allProducts = await fetchProducts();

      // 2. Parsear los códigos ingresados (separados por coma, espacio o nueva línea)
      const inputCodes = searchQuery
        .split(/[\n,; ]+/)
        .map(c => c.trim())
        .filter(c => c.length > 0);

      // Eliminamos duplicados en la entrada
      const uniqueInputCodes = [...new Set(inputCodes)];

      const found = [];
      const notFound = [];

      // 3. Buscar coincidencias localmente
      uniqueInputCodes.forEach(code => {
        const match = allProducts.find(p => {
          const pCode = p.CODIGO || p.codigo || p.Codigo || p.COD || p.cod || "";
          return pCode.toString().toLowerCase() === code.toLowerCase();
        });

        if (match) {
          found.push(match);
        } else {
          notFound.push(code);
        }
      });

      setFoundProducts(found);
      setNotFoundCodes(notFound);

      if (found.length > 0) {
        setSnackbar({ open: true, message: `Se encontraron ${found.length} productos`, severity: "success" });
      } else {
        setSnackbar({ open: true, message: "No se encontró ningún producto", severity: "error" });
      }

    } catch (error) {
      console.error("Error buscando productos:", error);
      setSnackbar({ open: true, message: "Error al buscar productos", severity: "error" });
    } finally {
      setIsSearching(false);
    }
  }

  const [globalVigencia, setGlobalVigencia] = useState(""); // Vigencia global para carga masiva

  // Agregar TODOS los encontrados a la lista
  function handleAddFoundProducts() {
    if (foundProducts.length === 0) return;

    const newItems = foundProducts.map(p => {
      let vigenciaFinal = p.vigencia || p.VIGENCIA || "";

      // Si el usuario escribió una vigencia global, sobreescribimos
      if (globalVigencia.trim()) {
        const text = globalVigencia.trim();
        // Agregamos prefijo "VIGENCIA: " si el usuario no lo puso
        if (!text.toUpperCase().startsWith("VIGENCIA")) {
          vigenciaFinal = `VIGENCIA: ${text}`;
        } else {
          vigenciaFinal = text;
        }
      }

      return {
        ...p,
        vigencia: vigenciaFinal,
        _uniqueId: crypto.randomUUID() // ID único para la lista
      };
    });

    setProducts((prev) => [...prev, ...newItems]);

    setShowModal(false);
    setSearchQuery("");
    setGlobalVigencia(""); // Limpiar
    setFoundProducts([]);
    setNotFoundCodes([]);
    setSnackbar({ open: true, message: `${newItems.length} productos agregados a la lista`, severity: "success" });
  }

  function handleRemoveFromList(uniqueId) {
    setProducts((prev) => prev.filter((p) => p._uniqueId !== uniqueId));
    setSnackbar({ open: true, message: "Producto eliminado de la lista", severity: "info" });
  }

  function requestAction(action) {
    setPendingAction(action);
    setPasswordInput("");
    setShowPasswordModal(true);
  }

  function handlePasswordSubmit() {
    if (passwordInput !== "abastecedor2026") {
      setSnackbar({ open: true, message: "Contraseña incorrecta", severity: "error" });
      return;
    }

    setShowPasswordModal(false);

    // Ejecutar acción pendiente
    if (pendingAction === "CSV") {
      // Importante: Esto debe suceder síncronamente tras el click del usuario en el modal
      setTimeout(() => {
        fileInputRef.current.click();
      }, 100);
    } else if (pendingAction === "CLEAR") {
      if (window.confirm("¿Estás seguro de vaciar toda la lista de impresión?")) {
        setProducts([]);
        localStorage.removeItem("carteleria_queue");
        setSnackbar({ open: true, message: "Lista vaciada", severity: "info" });
      }
    }
  }

  function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split("\n").map((r) => r.trim()).filter((r) => r.length > 0);

        if (rows.length < 2) {
          setSnackbar({ open: true, message: "El CSV debe tener encabezados y al menos una fila de datos", severity: "error" });
          return;
        }

        const firstRow = rows[0];
        // Detectar separador (si hay más ; que , usamos ;)
        const separator = (firstRow.match(/;/g) || []).length > (firstRow.match(/,/g) || []).length ? ";" : ",";

        // Función para normalizar cabeceras (Quitar acentos, minúsculas)
        const normalizeHeader = (h) => {
          return h.trim().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos (código -> codigo)
            .replace(/^"|"$/g, ""); // Quitar comillas
        };

        const headers = firstRow.split(separator).map(normalizeHeader);

        const parsed = [];
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(separator).map((v) => v.trim().replace(/^"|"$/g, ""));

          if (values.length < headers.length && values.join("").length === 0) continue;

          const product = {};
          headers.forEach((header, index) => {
            // El header ya está normalizado (ej: "codigo", "descripcion", "promocion")
            product[header] = values[index] || "";
          });
          parsed.push(product);
        }

        if (parsed.length === 0) {
          setSnackbar({ open: true, message: "No se encontraron productos válidos en el CSV", severity: "warning" });
          return;
        }

        // 1. AGREGAR AL DOM (OPTIMISTA - INMEDIATAMENTE)
        const newLocalItems = parsed.map(p => ({
          ...p,
          _uniqueId: crypto.randomUUID()
        }));

        setProducts(prev => [...prev, ...newLocalItems]);

        // 2. SUBIR A FIREBASE (EN SEGUNDO PLANO)
        try {
          const report = await uploadCSV(parsed);

          // Mensaje detallado
          let msg = `Carga visual lista. `;
          if (report.addedCount > 0) msg += `En BD: ${report.addedCount} nuevos. `;
          if (report.updatedCount > 0) msg += `🔄 ${report.updatedCount} actualizados. `;
          if (report.errorCount > 0) msg += `❌ ${report.errorCount} errores.`;

          setSnackbar({ open: true, message: msg, severity: "success" });
        } catch (apiError) {
          console.error(apiError);
          setSnackbar({ open: true, message: "Se cargó en lista pero hubo error guardando en base de datos.", severity: "warning" });
        }

      } catch (error) {
        setSnackbar({ open: true, message: "Error al procesar el CSV: " + error.message, severity: "error" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(".dropdown-wrapper")) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Campos a mostrar en la tabla
  const tableFields = ["codigo", "promocion", "descripcion", "gramaje", "oferta", "sucursales", "variedad", "vigencia"];

  return (
    <div className="container">



      {/* BOTONES SUPERIORES */}
      <div className="actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <button className="btn" onClick={() => setShowModal(true)}>
            ➕ Agregar Productos
          </button>

          <button
            className="btn upload-btn"
            style={{ marginLeft: "5px", cursor: "pointer" }}
            onClick={() => requestAction("CSV")}
          >
            📤 Cargar CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleCSVUpload}
          />
        </div>

        {products.length > 0 && (
          <div style={{ display: "flex" }}>
            <button
              className="btn"
              onClick={() => requestAction("CLEAR")}
              style={{ background: "#dc3545", color: "white" }}
            >
              🗑️ Vaciar Lista
            </button>

            <a
              href="/print-queue"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "10px",
                background: "#1976d2",
                color: "white"
              }}
            >
              🖨️ Descargar Todo PDF
            </a>
          </div>
        )}
      </div>

      {/* TABLA */}
      {
        products.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#666",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)"
          }}>
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>La lista de impresión está vacía</p>
            <p style={{ fontSize: "14px" }}>Agregá productos para verlos acá. Se guardarán automáticamente.</p>
          </div>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Promoción</th>
                <th>Descripción</th>
                <th>Gramaje</th>
                <th>Oferta</th>
                <th>Sucursales</th>
                <th>Variedad</th>
                <th>Vigencia</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._uniqueId || p.id}>
                  {tableFields.map((field) => (
                    <td key={field}>
                      {editMode === (p._uniqueId || p.id) && editableFields.includes(field) ? (
                        <input
                          value={p[field] || ""}
                          onChange={(e) => handleUpdate(p._uniqueId, field, e.target.value)}
                          style={{
                            background: "#fff3cd",
                            border: "2px solid #ffc107"
                          }}
                        />
                      ) : (
                        <span style={{
                          opacity: editMode === (p._uniqueId || p.id) && !editableFields.includes(field) ? 0.5 : 1
                        }}>
                          {p[field]}
                        </span>
                      )}
                    </td>
                  ))}

                  {/* ACCIONES */}
                  <td className="actions-col">
                    <div className="dropdown-wrapper" ref={dropdownRef}>
                      <button
                        className="btn-menu"
                        onClick={() =>
                          setDropdownOpen(dropdownOpen === (p._uniqueId || p.id) ? null : (p._uniqueId || p.id))
                        }
                      >
                        ⋮
                      </button>

                      {dropdownOpen === (p._uniqueId || p.id) && (
                        <div className="dropdown-menu">
                          <button onClick={() => toggleEditMode(p._uniqueId)}>
                            {editMode === (p._uniqueId || p.id) ? "❌ Cancelar edición" : "✏️ Editar"}
                          </button>

                          <a
                            href={`/print/${p._uniqueId || p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 12px",
                              textAlign: "left",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              textDecoration: "none",
                              color: "black",
                              fontFamily: "inherit",
                              fontSize: "inherit"
                            }}
                          >
                            🖨️ Imprimir A4
                          </a>

                          <button onClick={() => window.open(`/print/${p._uniqueId || p.id}`, '_blank')}>
                            🏷️ Imprimir Etiqueta
                          </button>

                          <button onClick={() => handleRemoveFromList(p._uniqueId)} style={{ color: "#dc3545" }}>
                            🗑️ Quitar de lista
                          </button>

                          {editMode === (p._uniqueId || p.id) && (
                            <button
                              onClick={() => saveChanges(p._uniqueId)}
                              style={{
                                background: "#28a745",
                                color: "white",
                                fontWeight: "bold"
                              }}
                            >
                              💾 Guardar cambios
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }

      {/* MODAL - BUSCAR MASIVA */}
      {
        showModal && (
          <div className="modal">
            <div className="modal-content" style={{ minWidth: "500px" }}>
              <h3>Agregar productos por códigos</h3>
              <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
                Ingresá los códigos separados por coma, espacio o enter.
              </p>

              {/* INPUT VIGENCIA */}
              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "5px" }}>
                  Vigencia para estos productos (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: 05/01 al 31/01"
                  value={globalVigencia}
                  onChange={(e) => setGlobalVigencia(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "5px"
                  }}
                />
                <small style={{ color: "#888", fontSize: "11px" }}>
                  Se mostrará como "VIGENCIA: {globalVigencia || '...'}"
                </small>
              </div>

              <textarea
                placeholder="Ej: 001, 002, 003..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "10px",
                  marginBottom: "10px",
                  fontFamily: "monospace"
                }}
              />

              <button
                className="btn"
                onClick={handleBulkSearch}
                disabled={isSearching}
                style={{ width: "100%", marginBottom: "15px" }}
              >
                {isSearching ? "Buscando..." : "🔍 Buscar Coincidencias"}
              </button>

              {/* RESULTADOS */}
              {foundProducts.length > 0 && (
                <div style={{
                  background: "#e8f5e9",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "10px",
                  maxHeight: "150px",
                  overflowY: "auto"
                }}>
                  <p style={{ fontWeight: "bold", color: "#2e7d32", marginBottom: "5px" }}>
                    ✅ Encontrados ({foundProducts.length}):
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
                    {foundProducts.map((p, i) => (
                      <li key={i}>
                        <strong>{p.codigo || p.CODIGO}</strong> - {p.descripcion || p.DESCRIPCION}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notFoundCodes.length > 0 && (
                <div style={{
                  background: "#ffebee",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "10px",
                  maxHeight: "100px",
                  overflowY: "auto"
                }}>
                  <p style={{ fontWeight: "bold", color: "#c62828", marginBottom: "5px" }}>
                    ❌ No encontrados ({notFoundCodes.length}):
                  </p>
                  <p style={{ fontSize: "13px", margin: 0 }}>
                    {notFoundCodes.join(", ")}
                  </p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="btn save"
                  onClick={handleAddFoundProducts}
                  disabled={foundProducts.length === 0}
                  style={{ opacity: foundProducts.length > 0 ? 1 : 0.5 }}
                >
                  Agregar ({foundProducts.length}) a lista
                </button>
                <button className="btn cancel" onClick={() => {
                  setShowModal(false);
                  setSearchQuery("");
                  setFoundProducts([]);
                  setNotFoundCodes([]);
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* SNACKBAR */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* PASSWORD DIALOG */}
      <Dialog open={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        <DialogTitle>Seguridad</DialogTitle>
        <DialogContent>
          <p>Esta acción requiere contraseña de administrador.</p>
          <TextField
            autoFocus
            margin="dense"
            label="Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePasswordSubmit();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div >
  );
}