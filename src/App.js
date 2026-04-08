import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Servicios from "./pages/Servicios";
import Nosotros from "./pages/Nosotros";
import Blog from "./pages/Blog";
import Contacto from "./pages/Contacto";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
