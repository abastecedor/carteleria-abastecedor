// src/components/PromoEtiqueta.jsx
import "./promo.css";

export default function PromoEtiqueta({ producto }) {
  if (!producto) return <p>Cargando...</p>;

  // Normalización de datos (Soporte para minúsculas del CSV y mayúsculas de Firestore antiguo)
  const descripcion = producto.DESCRIPCION || producto.descripcion || "";
  const variedad = producto.VARIEDAD || producto.variedad || "";
  const oferta = producto.OFERTA || producto.oferta || "";
  const vigencia = producto.VIGENCIA || producto.vigencia || "";
  const sucursales = producto.SUCURSALES || producto.sucursales || "";
  const gramaje = producto.GRAMAJE || producto.gramaje || "";
  const promocion = producto.PROMOCION || producto.promocion || "";

  return (
    <div className="promo-wrapper">
      <div className={`promo-box ${promocion ? "promo-box--with-promo" : ""}`}>

        {/* SI HAY PROMOCION: Se muestra arriba, grande */}
        {promocion && (
          <div className="promo-super-title">
            {promocion}
          </div>
        )}

        {/* ENCABEZADO: Descripción */}
        <div className="promo-header">
          <h1 className="promo-title">{descripcion}</h1>
          {variedad && <div className="promo-variedad">{variedad}</div>}
        </div>

        {/* CENTRO: Oferta Gigante */}
        <div className="promo-body">
          <div className="promo-oferta">{oferta}</div>
        </div>

        {/* PIE: Detalles alineados */}
        <div className="promo-footer">
          <div className="promo-foot-item text-left">
            <span className="label"></span> {vigencia}
          </div>
          <div className="promo-foot-item text-center">
            {sucursales}
          </div>
          <div className="promo-foot-item text-right">
            {gramaje}
          </div>
        </div>

      </div >
    </div >
  );
}
