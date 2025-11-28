import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductList from "./pages/ProductList";
import PrintPage from "./pages/PrintPage";
import PromoPrintPage from "./pages/PromoPrintPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/print/:id" element={<PrintPage />} />
        <Route path="/promo/:id" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
