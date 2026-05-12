import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Encabezado from "./components/navegacion/Encabezado";

import Inicio from "./views/Inicio";
import Categorias from "./views/Categorias";
import Catalogo from "./views/Catalogo";
import Productos from "./views/Productos";
import Login from "./views/Login";
import RutaProtegida from "./components/rutas/RutaProtegida";
import Pagina404 from "./views/Pagina404";
import Empleados from "./views/Empleados";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Encabezado />

      {/* Corregido: 'margen-superior-main' con 's' minúscula para que coincida con tu CSS */}
      <main className="margen-superior-main">
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas */}
          <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
          <Route path="/categorias" element={<RutaProtegida><Categorias /></RutaProtegida>} />
          
          {/* Nueva Ruta Protegida de Catálogo */}
          <Route path="/catalogo" element={<RutaProtegida><Catalogo /></RutaProtegida>} />
          
          <Route path="/productos" element={<RutaProtegida><Productos /></RutaProtegida>} />

          <Route path="/empleados" element={<RutaProtegida><Empleados /></RutaProtegida>} />

          {/* Ruta para errores 404 */}
          <Route path="*" element={<Pagina404 />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;