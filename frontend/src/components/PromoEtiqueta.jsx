// src/pages/PromoPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../components/promo.css";


const API_URL = "https://carteleria-backend-f9j8rwo8n-abastecedors-projects.vercel.app";

export default function PromoPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/products`)
      .then((res) => {
        const encontrado = res.data.find((p) => p.rowIndex === Number(id));
        setProducto(encontrado);
      })
      .catch((err) => {
        console.error("Error al obtener productos:", err);
      });
  }, [id]);

  if (!producto) return <p>Cargando...</p>;

  return (
    <div className="promo-wrapper">
      <div className="promo-box">

        <h1 className="promo-title pos-promo-title">{producto.DESCRIPCION}</h1>

        <div className="promo-variedad pos-promo-variedad">
          {producto.VARIEDAD}
        </div>

        <div className="promo-oferta pos-promo-oferta">
          {producto.OFERTA}
        </div>

        <div className="promo-footer">
          <div className="promo-foot-item pos-promo-vigencia">
            {producto.VIGENCIA}
          </div>
          <div className="promo-foot-item pos-promo-sucursal">
            {producto.SUCURSALES}
          </div>
          <div className="promo-foot-item pos-promo-gramaje">
            {producto.GRAMAJE}
          </div>
        </div>
      </div>
    </div>
  );
}
