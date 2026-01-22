import React from "react";
import "./small-label.css";

export default function PromoSmallLabel({ producto }) {
  if (!producto) return null;

  const descripcion = producto.DESCRIPCION || producto.descripcion || "";
  const oferta = producto.OFERTA || producto.oferta || "";
  const vigencia = producto.VIGENCIA || producto.vigencia || "";
  const gramaje = producto.GRAMAJE || producto.gramaje || "";
  const promocion = producto.PROMOCION || producto.promocion || "";
  const precioRegular = producto.PRECIO_REGULAR || producto.precio_regular || "";

  // Calcular precio sin IVA automáticamente desde el precio de oferta
  // Fórmula: Precio sin IVA = Precio con IVA / 1.21 (IVA 21%)
  const calcularSinIva = () => {
    if (!oferta) return "";

    // Parsear formato argentino: $1.234,56 → 1234.56
    // 1. Eliminar símbolo $ y espacios
    let precioStr = oferta.toString().replace(/[$\s]/g, "");
    // 2. Reemplazar punto (separador de miles) por nada
    precioStr = precioStr.replace(/\./g, "");
    // 3. Reemplazar coma (separador decimal) por punto
    precioStr = precioStr.replace(/,/g, ".");

    const precioNumerico = parseFloat(precioStr);

    if (isNaN(precioNumerico)) return "";

    const sinIvaCalculado = precioNumerico / 1.21;

    // Formatear en formato argentino: 1234.56 → $1.234,56
    const partes = sinIvaCalculado.toFixed(2).split(".");
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const decimal = partes[1];

    return `$${entero},${decimal}`;
  };

  const sinIva = calcularSinIva();

  return (
    <div className="label-container">
      {/* HEADER: Descripcion */}
      <div className="label-header">
        {descripcion}
      </div>

      <div className="label-body">
        {/* IZQUIERDA */}
        <div className="label-left">
          <div className="label-promocion">
            {promocion}
          </div>
          <div className="label-vigencia">
            {vigencia}
          </div>
        </div>

        {/* DERECHA */}
        <div className="label-right">
          <div className="label-oferta">
            {oferta}
          </div>
          <div className="label-details">
            {gramaje}
          </div>
          <div className="label-details">
            {precioRegular && `Precio Regular: ${precioRegular}`}
          </div>
          <div className="label-legal">
            "PRECIO SIN IMPUESTOS NACIONALES": {sinIva}
          </div>
        </div>
      </div>
    </div>
  );
}
