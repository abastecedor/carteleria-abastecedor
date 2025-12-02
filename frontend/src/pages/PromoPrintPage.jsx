import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PromoEtiqueta from "../components/PromoEtiqueta";
import { API_URL } from "../api";


const res = await axios.get(`${API_URL}/products`);



export default function PromoPrintPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${API_URL}/products`);
      const found = res.data.find((p) => p.rowIndex == id);
      setProducto(found);

      setTimeout(() => window.print(), 600);
    };

    load();
  }, [id]);

  return <PromoEtiqueta producto={producto} />;
}
