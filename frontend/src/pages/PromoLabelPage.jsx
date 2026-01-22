import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PromoSmallLabel from "../components/PromoSmallLabel";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PromoLabelPage() {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);

    useEffect(() => {
        const load = async () => {
            // 1. Intentar buscar en LOCAL STORAGE
            const savedQueue = localStorage.getItem("carteleria_queue");
            if (savedQueue) {
                const localItems = JSON.parse(savedQueue);
                const localMatch = localItems.find(p => String(p._uniqueId) === id || String(p.id) === id);

                if (localMatch) {
                    setProducto(localMatch);
                    return;
                }
            }

            // 2. Buscar en FIRESTORE
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
        const element = document.getElementById("print-label-area");
        // Aunque sea una etiqueta chica, capturamos el área necesaria. 
        // Si queremos capturar solo la etiqueta, usamos el ID de la etiqueta container?
        // El usuario quiere imprimir en A4. Podríamos generar un PDF A4 que contenga la imagen.

        // Opcion 1: Imprimir tal cual lo ve el navegador (window.print())
        // Opcion 2: Generar PDF con jsPDF.

        // Vamos con jsPDF para consistencia con el otro botón.

        const canvas = await html2canvas(element, {
            scale: 4, // Alta resolución
            backgroundColor: "#ffffff",
            useCORS: true
        });

        const imgData = canvas.toDataURL("image/png");

        // PDF A4 vertical (portrait)
        const pdf = new jsPDF("p", "mm", "a4");

        // 12cm = 120mm, 4cm = 40mm
        // Posicionamos la imagen en el PDF. ¿Arriba a la izquierda?
        // element es el 'label-container' de 120x40mm.

        // Si capturamos solo el div de la etiqueta:
        const pdfWidth = 120;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        // Debería ser 40mm si el ratio es correcto.

        pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
        // Margen 10mm top-left

        pdf.save("etiqueta-12x4.pdf");
    }

    if (!producto) return <p>Cargando...</p>;

    return (
        <div style={{ background: "#eee", minHeight: "100vh", padding: 20 }}>
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
                    fontSize: 15,
                    marginRight: "10px"
                }}
            >
                Descargar Etiqueta PDF
            </button>

            {/* Visualización en pantalla simulando hoja A4 */}
            <div
                style={{
                    width: "210mm",
                    height: "297mm",
                    background: "white",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    padding: "10mm", // Margen de hoja
                    boxSizing: "border-box"
                }}
            >
                {/* Envolvemos en un div para capturar con html2canvas específicamente este nodo si queremos */}
                <div id="print-label-area" style={{ display: "inline-block" }}>
                    <PromoSmallLabel producto={producto} />
                </div>
            </div>
        </div>
    );
}
