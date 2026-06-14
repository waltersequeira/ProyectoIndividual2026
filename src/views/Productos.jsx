import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroProducto from "../productos/ModalRegistroProducto";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaProductos from "../productos/TablaProductos";
import CuadroBusquedas from "../busquedas/CuadroBusquedas";
import ModalEdicionProducto from "../productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../productos/ModalEliminacionProducto";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ModalQRProducto from "../productos/ModalQRProducto";
import html2canvas from "html2canvas";

const Productos = () => {

  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  const [mostrarModalQR, setMostrarModalQR] = useState(false);
  const [productoQR, setProductoQR] = useState(null);

  // FUNCIÓN PARA COPIAR AL PORTAPAPELES
  const copiarProducto = async (producto) => {
    const texto = `${producto.nombre_producto} - S/ ${producto.precio_venta.toFixed(2)}`;
    try {
      await navigator.clipboard.writeText(texto);
      setToast({ mostrar: true, mensaje: "Producto copiado al portapapeles", tipo: "exito" });
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al copiar", tipo: "error" });
    }
  };

  // FUNCIÓN PARA ABRIR EL MODAL DEL QR
  const generarQRImagen = (producto) => {
    setProductoQR(producto);
    setMostrarModalQR(true);
  };

  // FUNCIÓN DEL PDF CORREGIDA PARA MOSTRAR EL NOMBRE REAL DE LA CATEGORÍA
  const generarPDFProducto = (producto) => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Producto", 14, 20);

    // Línea decorativa
    doc.line(14, 25, 195, 25);

    // Buscamos el nombre de la categoría para el PDF
    const nombreCategoriaReal = obtenerNombreCategoria(producto.categoria_producto);

    // Información del producto
    doc.setFontSize(12);
    autoTable(doc, {
      startY: 35,
      head: [["Campo", "Valor"]],
      body: [
        ["ID", producto.id_producto],
        ["Nombre", producto.nombre_producto],
        ["Descripción", producto.descripcion_producto || "Sin descripción"],
        ["Categoría", nombreCategoriaReal],
        ["Precio de venta", producto.precio_venta != null ? `S/ ${producto.precio_venta.toFixed(2)}` : "-"],
      ],
    });

    // Descargar PDF
    doc.save(`producto_${producto.id_producto}.pdf`);
  };

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    archivo: null,
  });

  const [productoEditar, setProductoEditar] = useState({
    id_producto: "",
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    url_imagen: "",
    archivo: null,
  });

  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });


  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };


  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(productos);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = productos.filter((prod) => {
        const nombre = prod.nombre_producto?.toLowerCase() || "";
        const descripcion = prod.descripcion_producto?.toLowerCase() || "";
        const precio = prod.precio_venta?.toString() || "";
        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          precio.includes(textoLower)
        );
      });
      setProductosFiltrados(filtrados);
    }
  }, [textoBusqueda, productos]);

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id_producto", { ascending: true });
      if (error) throw error;
      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerNombreCategoria = (idCategoria) => {
    const categoria = categorias.find((cat) => cat.id_categoria === idCategoria);
    return categoria?.nombre_categoria || idCategoria || "Sin categoría";
  };

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria", { ascending: true });
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const limpiarNombreArchivo = (nombre) => {
    return nombre
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita acentos
      .replace(/[^a-z0-9.]/gi, '_')                     // Cambia símbolos y espacios por guion bajo
      .toLowerCase();
  };

  const agregarProducto = async () => {
    try {
      if (
        !nuevoProducto.nombre_producto.trim() ||
        !nuevoProducto.categoria_producto ||
        !nuevoProducto.precio_venta ||
        !nuevoProducto.archivo
      ) {
        setToast({
          mostrar: true,
          mensaje: "Completar los campos obligatorios (nombre, categoria, precio e imagen)",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModal(false);

      const nombreLimpio = limpiarNombreArchivo(nuevoProducto.archivo.name);
      const nombreArchivo = `${Date.now()}_${nombreLimpio}`;


      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo, nuevoProducto.archivo);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);

      const urlPublica = urlData.publicUrl;

      const { error: insertError } = await supabase.from("productos").insert([
        {
          nombre_producto: nuevoProducto.nombre_producto,
          descripcion_producto: nuevoProducto.descripcion_producto || null,
          categoria_producto: nuevoProducto.categoria_producto,
          precio_venta: parseFloat(nuevoProducto.precio_venta),
          url_imagen: urlPublica,
        },
      ]);

      if (insertError) throw insertError;

      await cargarProductos();

      setNuevoProducto({
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        archivo: null,
      });

      setToast({ mostrar: true, mensaje: "Producto registrado correctamente", tipo: "exito" });

    } catch (err) {
      console.error("Error al agregar producto:", err);
      setToast({ mostrar: true, mensaje: "Error al registrar producto", tipo: "error" });
    }
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivoActualizar = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({ ...prev, archivo }));
    }
  };

  const abrirModalEdicion = (producto) => {
    if (producto && producto.id_producto) {
      setProductoEditar({ ...producto, archivo: null });
      setMostrarModalEdicion(true);
    } else {
      console.error("Error: El producto no tiene un ID válido", producto);
    }
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const actualizarProducto = async () => {
    try {
      // 1. VALIDACIÓN DETALLADA
      if (!productoEditar.nombre_producto?.trim()) {
        setToast({ mostrar: true, mensaje: "Falta el nombre", tipo: "advertencia" });
        return;
      }
      if (!productoEditar.categoria_producto) {
        setToast({ mostrar: true, mensaje: "Falta la categoría", tipo: "advertencia" });
        return;
      }
      if (productoEditar.precio_venta === "" || productoEditar.precio_venta === null) {
        setToast({ mostrar: true, mensaje: "Falta el precio", tipo: "advertencia" });
        return;
      }

      setMostrarModalEdicion(false);

      // 2. PREPARAR DATOS
      let datosActualizados = {
        nombre_producto: productoEditar.nombre_producto,
        descripcion_producto: productoEditar.descripcion_producto || null,
        categoria_producto: productoEditar.categoria_producto,
        precio_venta: parseFloat(productoEditar.precio_venta) || 0,
        url_imagen: productoEditar.url_imagen,
      };

      // 3. PROCESAR IMAGEN SI HAY UNA NUEVA
      if (productoEditar.archivo) {
        const nombreLimpio = limpiarNombreArchivo(productoEditar.archivo.name);
        const nombreArchivo = `${Date.now()}_${nombreLimpio}`;

        const { error: uploadError } = await supabase.storage
          .from("imagenes_productos")
          .upload(nombreArchivo, productoEditar.archivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("imagenes_productos")
          .getPublicUrl(nombreArchivo);

        datosActualizados.url_imagen = urlData.publicUrl;

        // Eliminar imagen anterior
        if (productoEditar.url_imagen) {
          const nombreAnterior = productoEditar.url_imagen.split("/").pop().split("?")[0];
          await supabase.storage.from("imagenes_productos").remove([nombreAnterior]).catch(() => { });
        }
      }

      // 4. ACTUALIZAR EN SUPABASE
      const { error } = await supabase
        .from("productos")
        .update(datosActualizados)
        .eq("id_producto", productoEditar.id_producto);

      if (error) throw error;

      // 5. FINALIZAR
      await cargarProductos();
      setProductoEditar({
        id_producto: "",
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        url_imagen: "",
        archivo: null,
      });

      setToast({ mostrar: true, mensaje: "Producto actualizado correctamente", tipo: "exito" });

    } catch (err) {
      console.error("Error al actualizar:", err);
      setToast({ mostrar: true, mensaje: "Error al actualizar producto", tipo: "error" });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bag-heart-fill me-2"></i> Productos
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Producto</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, descripción o precio..."
          />
        </Col>
      </Row>

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
        categorias={categorias}
      />

      <ModalEliminacionProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        setProductoAEliminar={setProductoAEliminar}
        productoAEliminar={productoAEliminar}
        setToast={setToast}
        cargarProductos={cargarProductos}
      />

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
        actualizarProducto={actualizarProducto}
        categorias={categorias}
      />

      <ModalQRProducto
        mostrar={mostrarModalQR}
        onHide={() => setMostrarModalQR(false)}
        producto={productoQR}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

      {/* RENDERIZADO ÚNICO DE LA TABLA COMPONENTE */}
      <Row className="mt-4">
        <Col lg={12}>
          {cargando ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 mb-0">Cargando productos...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="alert alert-info">No hay productos para mostrar.</div>
          ) : (
            <TablaProductos
              productos={productosFiltrados}
              categorias={categorias}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              generarPDFProducto={generarPDFProducto}
              generarQRImagen={generarQRImagen}
              copiarProducto={copiarProducto}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Productos;