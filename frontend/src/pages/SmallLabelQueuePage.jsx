import React, { useEffect, useState } from "react";
import PromoSmallLabel from "../components/PromoSmallLabel";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";

export default function SmallLabelQueuePage() {
    const [products, setProducts] = useState([]);
    const [pages, setPages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    // Configuración A4 Horizontal
    // Ancho: 297mm. Alto: 210mm.
    // Etiqueta: 120mm x 40mm.
    // Layout: 2 columnas, 5 filas = 10 etiquetas por hoja.
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const saved = localStorage.getItem("carteleria_queue");
        if (saved) {
            const loadedProducts = JSON.parse(saved);
            setProducts(loadedProducts);

            // Agrupar en páginas
            const chunks = [];
            for (let i = 0; i < loadedProducts.length; i += ITEMS_PER_PAGE) {
                chunks.push(loadedProducts.slice(i, i + ITEMS_PER_PAGE));
            }
            setPages(chunks);
        }
    }, []);

    async function generatePDF() {
        if (pages.length === 0) return;
        setIsGenerating(true);
        setProgress(0);

        const pdf = new jsPDF("l", "mm", "a4");
        const container = document.getElementById("small-label-queue-container");

        // Iteramos sobre las "Páginas" div
        const pageElements = container.children;

        for (let i = 0; i < pageElements.length; i++) {
            const pageDiv = pageElements[i];

            // Renderizamos toda la hoja A4 con sus etiquetas
            // Usamos scale bajo para rapidez o alto para calidad.
            // Al ser texto pequeño, necesitamos buena calidad. scale 2 mínimo.

            // Forzar reflow/display si estuviera oculto, pero aquí está visible.

            const canvas = await html2canvas(pageDiv, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true
            });

            const imgData = canvas.toDataURL("image/png");
            const pdfWidth = 297;
            const pdfHeight = 210;

            // Si no es la primera página del PDF, agregamos hoja
            if (i > 0) {
                pdf.addPage();
            }

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            setProgress(Math.round(((i + 1) / pageElements.length) * 100));
        }

        pdf.save("etiquetas-12x4-masivas.pdf");
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
            {/* HEADER */}
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
                    <h2 style={{ margin: 0 }}>Impresión Etiquetas 12x4 ({products.length} productos)</h2>
                    <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                        {pages.length} hojas A4 en total (10 etiquetas por hoja máx).
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
                                🖨️ Descargar Todas (Etiquetas)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENEDOR DE PAGINAS A4 */}
            <div id="small-label-queue-container" style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                alignItems: "center"
            }}>
                {pages.map((pageDataChunk, pageIndex) => (
                    <div
                        key={pageIndex}
                        style={{
                            width: "297mm",
                            height: "210mm",
                            background: "white",
                            boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                            padding: "10mm", // Margen de hoja A4
                            boxSizing: "border-box",
                            display: "flex",
                            flexWrap: "wrap",
                            alignContent: "flex-start", // Alinear filas al inicio
                            // gap: "0", // Gap controlado manualmente o 0 si cabe justo? 
                            // 297mm width. 10mm padding L/R -> 277mm available.
                            // 2 labels of 120mm = 240mm.
                            // Remaining: 37mm space.
                            // Space between cols: ~10mm.
                            justifyContent: "space-between", // Separar las columnas
                            overflow: "hidden"
                        }}
                    >
                        {pageDataChunk.map((prod) => (
                            <div
                                key={prod._uniqueId || prod.id}
                                style={{
                                    marginBottom: "10px", // Separación vertical entre filas
                                    // Separación horizontal auto por space-between
                                }}
                            >
                                <PromoSmallLabel producto={prod} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
