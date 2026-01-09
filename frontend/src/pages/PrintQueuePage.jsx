import React, { useEffect, useState, useRef } from "react";
import PromoEtiqueta from "../components/PromoEtiqueta";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";

export default function PrintQueuePage() {
    const [products, setProducts] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem("carteleria_queue");
        if (saved) {
            setProducts(JSON.parse(saved));
        }
    }, []);

    async function generatePDF() {
        if (products.length === 0) return;
        setIsGenerating(true);
        setProgress(0);

        const pdf = new jsPDF("l", "mm", "a4");
        const container = document.getElementById("print-queue-container");

        // Iteramos sobre los hijos del contenedor (cada cartel)
        const carteles = container.children;

        for (let i = 0; i < carteles.length; i++) {
            const element = carteles[i];

            // Capturar canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true
            });

            const imgData = canvas.toDataURL("image/png");
            const pdfWidth = 297;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Si no es la primera página, agregamos una nueva
            if (i > 0) {
                pdf.addPage();
            }

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            // Actualizar progreso
            setProgress(Math.round(((i + 1) / carteles.length) * 100));
        }

        pdf.save("carteles-masivos.pdf");
        setIsGenerating(false);
    }

    if (products.length === 0) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h2>No hay productos en la lista de impresión</h2>
                <Link to="/" className="btn" style={{ textDecoration: "none", marginTop: 20, display: "inline-block" }}>
                    Volver al listado
                </Link>
            </div>
        );
    }

    return (
        <div style={{ background: "#eee", minHeight: "100vh", padding: 20 }}>
            {/* HEADER / CONTROLES */}
            <div style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                background: "white",
                padding: "15px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: "8px"
            }}>
                <div>
                    <h2 style={{ margin: 0 }}>Vista Previa de Impresión ({products.length} carteles)</h2>
                    <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                        Revisá que las vigencias y datos estén correctos antes de descargar.
                    </p>
                </div>

                <div style={{ textAlign: "right" }}>
                    {isGenerating ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontWeight: "bold", color: "#dd352a" }}>Generando PDF... {progress}%</span>
                            <div style={{ width: "100px", height: "10px", background: "#eee", borderRadius: "5px", overflow: "hidden" }}>
                                <div style={{ width: `${progress}%`, height: "100%", background: "#dd352a", transition: "width 0.3s" }}></div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Link to="/" className="btn cancel" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                                🔙 Volver
                            </Link>
                            <button
                                onClick={generatePDF}
                                className="btn"
                                style={{ background: "#dd352a", color: "white", border: "none", fontSize: "16px" }}
                            >
                                🖨️ Descargar Todo PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENEDOR DE CARTELES (VISIBLE PARA QUE HTML2CANVAS FUNCIONE) */}
            <div id="print-queue-container" style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                alignItems: "center"
            }}>
                {products.map((p, i) => (
                    <div
                        key={p._uniqueId || i}
                        style={{
                            width: "297mm",
                            height: "210mm",
                            background: "white",
                            boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                            overflow: "hidden" // Asegurar que nada salga del formato
                        }}
                    >
                        <PromoEtiqueta producto={p} />
                    </div>
                ))}
            </div>
        </div>
    );
}
