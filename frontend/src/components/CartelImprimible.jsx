// src/components/CartelImprimible.jsx
import React from "react";
import "./cartel.css";

export default function CartelImprimible({ producto }) {
  if (!producto) return null;

  return (
    <div className="cartel-wrapper">
      <div className="cartel-box">

        {/* DESCRIPCIÓN */}
        <h1 className="cartel-title pos-descripcion">
          {producto.DESCRIPCION}
        </h1>

        {/* CENTRO (OFERTA) */}
        <div className="cartel-middle pos-oferta-wrapper">
          <div className="oferta-center">

            

            <span className="value-oferta pos-value-oferta">
              {producto.OFERTA}
            </span>

          </div>
        </div>

        {/* PIE INFERIOR */}
        <div className="cartel-footer">

          {/* IZQUIERDA – VIGENCIA */}
          <div className="footer-block left-block pos-vigencia-wrapper">
            
            <span className="value-vigencia pos-value-vigencia">
              {producto.VIGENCIA}
            </span>
          </div>

          {/* CENTRO – SUCURSAL */}
          <div className="footer-block center-block pos-sucursal-wrapper">
            
            <span className="value-sucursales pos-value-sucursal">
              {producto.SUCURSALES}
            </span>
          </div>

          {/* DERECHA – GRAMAJE */}
          <div className="footer-block right-block pos-gramaje-wrapper">
            
            <span className="value-gramaje pos-value-gramaje">
              {producto.GRAMAJE}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
