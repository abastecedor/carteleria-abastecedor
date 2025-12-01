// src/pages/PrintPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../components/cartel.css";

export default function PrintPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get("https://carteleria-abastecedor.onrender.com/products");
      const encontrado = res.data.find((p) => p.rowIndex === Number(id));
      setProducto(encontrado);

      // Automáticamente imprimir cuando cargó
      setTimeout(() => {
        window.print();
      }, 500);
    };

    load();
  }, [id]);

  if (!producto) return <p>Cargando…</p>;

  return (
    <div className="cartel-wrapper">
      <div className="cartel-box">
        <h1 className="cartel-title pos-cartel-title">{producto.DESCRIPCION}</h1>

        <div className="cartel-variedad pos-cartel-variedad">
          {producto.VARIEDAD}
        </div>

        <div className="cartel-middle pos-cartel-oferta">
          <div className="oferta-center">
            <span className="value-oferta">{producto.OFERTA}</span>
          </div>
        </div>

        <div className="cartel-footer">
          <div className="footer-block left-block pos-vigencia">
            <span className="value-vigencia">{producto.VIGENCIA}</span>
          </div>
          <div className="footer-block center-block pos-sucursal">
            <span className="value-sucursales">{producto.SUCURSALES}</span>
          </div>
          <div className="footer-block right-block pos-gramaje">
            <span className="value-gramaje">{producto.GRAMAJE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
