import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PromoEtiqueta from "../components/PromoEtiqueta";

import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PromoPrintPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const load = async () => {
      // 1. Intentar buscar en LOCAL STORAGE (para productos nuevos de CSV o editados temporalmente)
      const savedQueue = localStorage.getItem("carteleria_queue");
      if (savedQueue) {
        const localItems = JSON.parse(savedQueue);
        // Buscamos por _uniqueId o por id (Firestore ID)
        const localMatch = localItems.find(p => String(p._uniqueId) === id || String(p.id) === id);

        if (localMatch) {
          setProducto(localMatch);
          return; // Si encontró local, no busca en firebase
        }
      }

      // 2. Si no está local, buscar en FIRESTORE (Legacy o links directos)
      try {
        const ref = doc(db, "carteleria", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProducto(snap.data());
        } else {
          console.error("Producto no encontrado en DB");
        }
      } catch (error) {
        console.error("Error cargando producto:", error);
      }
    };

    if (id && id !== "undefined") {
      load();
    }
  }, [id]);

  async function generarPDF() {
    const element = document.getElementById("print-a4");

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("l", "mm", "a4");

    const pdfWidth = 297;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("cartel-a4-horizontal.pdf");
  }

  if (!producto) return <p>Cargando…</p>;

  return (
    <div style={{ background: "#eee", minHeight: "100vh", padding: 20 }}>

      {/* BOTÓN */}
      <button
        onClick={generarPDF}
        style={{
          marginBottom: 20,
          padding: "10px 16px",
          background: "#dd352a",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 15
        }}
      >
        Descargar PDF A4
      </button>

      {/* HOJA A4 LANDSCAPE */}
      <div id="print-a4" style={{ width: "297mm", height: "210mm", margin: "0 auto", background: "white", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <PromoEtiqueta producto={producto} />
      </div>
    </div>
  );
}
