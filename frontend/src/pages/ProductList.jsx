// src/pages/ProductList.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css"; // 🔥 Importante
import { API_URL } from "../api";


const res = await axios.get(`${API_URL}/products`);


const SUCURSALES = [
  "Martin Fierro", "Udaondo", "Irusta", "Gorriti",
  "Barcala", "Brandsen", "Repetto", "Palos",
  "Pringles", "Alvear", "Fragio", "Marketing",
];

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editorSucursal, setEditorSucursal] = useState("");

  const load = async () => {
    const res = await axios.get(`${API_URL}/products`);
    setProducts(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (product) => setEditingRow({ ...product });

  const onChange = (e) => {
    setEditingRow({
      ...editingRow,
      [e.target.name]: e.target.value,
    });
  };

  const saveEdit = async () => {
    if (!editorSucursal) {
      alert("⚠️ Debes seleccionar una sucursal antes de editar");
      return;
    }

    await axios.put(`${API_URL}/products/update`, {
      rowIndex: editingRow.rowIndex,
      updatedData: editingRow,
      editorSucursal,
    });

    setEditingRow(null);
    load();
  };

  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="app-header">Cartelería · El Abastecedor</div>

      {/* SELECTOR */}
      <div className="sucursal-box">
        <span className="sucursal-label">Sucursal:</span>
        <select
          className="sucursal-select"
          value={editorSucursal}
          onChange={(e) => setEditorSucursal(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {SUCURSALES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* TABLA */}
      <table className="products-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Variedad</th>
            <th>Oferta</th>
            <th>Gramaje</th>
            <th>Sucursales</th>
            <th>Vigencia</th>
            <th>Última edición</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) =>
            editingRow?.rowIndex === p.rowIndex ? (
              <tr key={p.rowIndex}>
                {[
                  "CODIGO", "DESCRIPCION", "VARIEDAD",
                  "OFERTA", "GRAMAJE", "SUCURSALES", "VIGENCIA",
                ].map((field) => (
                  <td key={field}>
                    <input
                      className="input-edit"
                      name={field}
                      value={editingRow[field]}
                      onChange={onChange}
                    />
                  </td>
                ))}
                <td>{p.ULTIMA_EDICION}</td>
                <td>
                  <button className="btn btn-edit" onClick={saveEdit}>Guardar</button>
                  <button className="btn btn-promo" onClick={() => setEditingRow(null)}>Cancelar</button>
                </td>
              </tr>
            ) : (
              <tr key={p.rowIndex}>
                <td>{p.CODIGO}</td>
                <td>{p.DESCRIPCION}</td>
                <td>{p.VARIEDAD}</td>
                <td>{p.OFERTA}</td>
                <td>{p.GRAMAJE}</td>
                <td>{p.SUCURSALES}</td>
                <td>{p.VIGENCIA}</td>
                <td>{p.ULTIMA_EDICION}</td>
                <td>
                  <button className="btn btn-edit" onClick={() => startEdit(p)}>Editar</button>
                  <button className="btn btn-print" onClick={() => window.open(`/print/${p.rowIndex}`, "_blank")}>Cartel A4</button>
                  <button className="btn btn-promo" onClick={() => window.open(`/promo/${p.rowIndex}`, "_blank")}>Etiqueta Promo</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

    </div>
  );
}
