import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PromoEtiqueta from "../components/PromoEtiqueta";

export default function PromoPrintPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get("https://carteleria-abastecedor.onrender.com");
      const found = res.data.find(p => p.rowIndex == id);
      setProducto(found);

      setTimeout(() => window.print(), 600);
    };

    load();
  }, [id]);

  return <PromoEtiqueta producto={producto} />;
}
