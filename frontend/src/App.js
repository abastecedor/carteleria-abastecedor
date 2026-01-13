import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import ProductList from "./pages/ProductList.jsx";
import PromoPrintPage from "./pages/PromoPrintPage.jsx";
import PrintQueuePage from "./pages/PrintQueuePage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Pantalla principal */}
        <Route
          path="/"
          element={
            <div className="App">
              <div style={{ textAlign: "center", paddingTop: "10px" }}>
                <img src={`${process.env.PUBLIC_URL}/logo_abastecedor.png`} alt="Abastecedor" style={{ height: "120px", maxWidth: "100%", objectFit: "contain" }} />
              </div>
              <h1 id="carteleria">Cartelería</h1>
              <ProductList />
            </div>
          }
        />

        {/* IMPRESIÓN MASIVA */}
        <Route path="/print-queue" element={<PrintQueuePage />} />

        {/* IMPRESIÓN A4 */}
        <Route path="/print/:id" element={<PromoPrintPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
