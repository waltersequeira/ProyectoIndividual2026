import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCategoria from "../categorias/ModalRegistroCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCategorias from "../categorias/TablaCategorias";
import ModalEdicionCategoria from "../categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../categorias/ModalEliminacionCategoria";
import TarjetaCategoria from "../categorias/TarjetaCategoria";
import CuadroBusquedas from "../busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ModalEnvioCorreoCategorias from "../categorias/ModalEnvioCorreoCategorias";
import emailjs from '@emailjs/browser';
import ModalQRProducto from "../productos/ModalQRProducto";

const Categorias = () => {

    const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
    const [emailDestino, setEmailDestino] = useState("");
    const [enviandoCorreo, setEnviandoCorreo] = useState(false);


    const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
    const [paginaActual, establecerPaginaActual] = useState(1);

    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
    const [mostrarModal, setMostrarModal] = useState(false);

    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true); // Estado de carga inicial
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

    const [mostrarModalQR, setMostrarModalQR] = useState(false);
    const [productoQR, setProductoQR] = useState(null);

    const generarQRImagen = (item) => {
        setProductoQR(item);
        setMostrarModalQR(true);
    };

    const copiarCategoria = async (categoria) => {
        if (!categoria) return;

        const texto = `
    ID: ${categoria.id_categoria}
    Categoria: ${categoria.nombre_categoria}
    Descripcion: ${categoria.descripcion_categoria || 'Sin descripcion'}`;

        try {
            await navigator.clipboard.writeText(texto);

            setToast({
                mostrar: true,
                mensaje: `Categoria "${categoria.nombre_categoria}" copiada al portapapeles`,
                tipo: "exito",
            });
        } catch (err) {
            console.error("Error al copiar:", err);
            setToast({
                mostrar: true,
                mensaje: "No se pudo copiar al portapapeles",
                tipo: "error",
            });
        }
    };

    const generarPDFCategoria = (categoria) => {

        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.text("Reporte de Categoría", 14, 20);

        // Línea decorativa
        doc.line(14, 25, 195, 25);

        // Información de la categoría
        doc.setFontSize(12);

        autoTable(doc, {
            startY: 35,
            head: [["Campo", "Valor"]],
            body: [
                ["ID", categoria.id_categoria],
                ["Nombre", categoria.nombre_categoria],
                ["Descripción", categoria.descripcion_categoria],
            ],
        });

        // Descargar PDF
        doc.save(`categoria_${categoria.id_categoria}.pdf`);
    };


    const categoriasPaginadas = categoriasFiltradas.slice(
        (paginaActual - 1) * registrosPorPagina,
        paginaActual * registrosPorPagina
    );

    const manejarBusqueda = (e) => {
        setTextoBusqueda(e.target.value);
    };

    useEffect(() => {
        if (!textoBusqueda.trim()) {
            setCategoriasFiltradas(categorias);
        } else {
            const textoLower = textoBusqueda.toLowerCase().trim();
            const filtradas = categorias.filter(
                (cat) =>
                    cat.nombre_categoria.toLowerCase().includes(textoLower) ||
                    (cat.descripcion_categoria && cat.descripcion_categoria.toLowerCase().includes(textoLower))
            );
            setCategoriasFiltradas(filtradas);
        }
    }, [textoBusqueda, categorias]);

    useEffect(() => {
        establecerPaginaActual(1);
    }, [textoBusqueda]);

    const [categoriaEditar, setCategoriaEditar] = useState({
        id_categoria: "",
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    const abrirModalEdicion = (categoria) => {
        setCategoriaEditar({
            id_categoria: categoria.id_categoria,
            nombre_categoria: categoria.nombre_categoria,
            descripcion_categoria: categoria.descripcion_categoria,
        });
        setMostrarModalEdicion(true);
    };

    const abrirModalEliminacion = (categoria) => {
        setCategoriaAEliminar(categoria);
        setMostrarModalEliminacion(true);
    };

    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categoria", { ascending: true });
            if (error) {
                console.error("Error al cargar categorias:", error.message);
                setToast({
                    mostrar: true,
                    mensaje: "Error al cargar categorias.",
                    tipo: "error",
                });
                return;
            }
            console.log("cargandoCategorias");
            console.log(data);
            setCategorias(data || []);
        } catch (err) {
            console.error("Excepcion al cargar categorias:", err.message);
            setToast({
                mostrar: true,
                mensaje: "Error inesperado al cargaar categorias.",
                tipo: "error",
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);


    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const agregarCategoria = async () => {
        try {
            if (
                !nuevaCategoria.nombre_categoria.trim() ||
                !nuevaCategoria.descripcion_categoria.trim()
            ) {
                setToast({
                    mostrar: true,
                    mensaje: "Debe llenar todos los campos.",
                    tipo: "advertencia",
                });
                return;
            }

            const { error } = await supabase.from("categorias").insert([
                {
                    nombre_categoria: nuevaCategoria.nombre_categoria,
                    descripcion_categoria: nuevaCategoria.descripcion_categoria,
                },
            ]);

            if (error) {
                console.error("Error al agregar categoria:", error.message);
                setToast({
                    mostrar: true,
                    mensaje: "Error al registrar la categoria.",
                    tipo: "error",
                });
                return;
            }

            //Exito
            setToast({
                mostrar: true,
                mensaje: `Categoria "${nuevaCategoria.nombre_categoria}" registrada exitosamente.`,
                tipo: "exito",
            });

            // limpiar formulario y cerrar modal
            setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
            setMostrarModal(false);

            await cargarCategorias();

        } catch (err) {
            console.error("Excepcion al agregar categoria:", err.message);
            setToast({
                mostrar: true,
                mensaje: "Error inesperado al registrar categoria.",
                tipo: "error",
            });
        }
    };

    const actualizarCategoria = async () => {
        try {
            if (
                !categoriaEditar.nombre_categoria.trim() ||
                !categoriaEditar.descripcion_categoria.trim()
            ) {
                setToast({
                    mostrar: true,
                    mensaje: "Debe llenar todos los campos.",
                    tipo: "advertencia",
                });
                return;
            }

            setMostrarModalEdicion(false);

            const { error } = await supabase
                .from("categorias")
                .update({
                    nombre_categoria: categoriaEditar.nombre_categoria,
                    descripcion_categoria: categoriaEditar.descripcion_categoria,
                })
                .eq("id_categoria", categoriaEditar.id_categoria);

            if (error) {
                console.error("Error al actualizar categoria:", error.message);
                setToast({
                    mostrar: true,
                    mensaje: `Error al actualizar la categoria ${categoriaEditar.nombre_categoria}.`,
                    tipo: "error",
                });
                return;
            }

            await cargarCategorias();
            setToast({
                mostrar: true,
                mensaje: `Categoria ${categoriaEditar.nombre_categoria} actualizada exitosamente.`,
                tipo: "exito",
            });
        } catch (err) {
            setToast({
                mostrar: true,
                mensaje: "Error inesperado al actualizar categoria.",
                tipo: "error",
            });
            console.error("Excepcion al actualizar categoria:", err.message);
        }
    };

    const eliminarCategoria = async () => {
        if (!categoriaAEliminar) return;
        try {
            setMostrarModalEliminacion(false);

            const { error } = await supabase
                .from("categorias")
                .delete()
                .eq("id_categoria", categoriaAEliminar.id_categoria);

            if (error) {
                console.error("Error al eliminar categoria:", error.message);
                setToast({
                    mostrar: true,
                    mensaje: `Error al eliminar la categoria ${categoriaAEliminar.nombre_categoria}.`,
                    tipo: "error",
                });
                return;
            }

            await cargarCategorias();
            setToast({
                mostrar: true,
                mensaje: `Categoria ${categoriaAEliminar.nombre_categoria} eliminada exitosamente.`,
                tipo: "exito",
            });
        } catch (err) {
            setToast({
                mostrar: true,
                mensaje: "Error inesperado al eliminar categoria.",
                tipo: "error",
            });
            console.error("Excepcion al eliminar categoria:", err.message);
        }
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setCategoriaEditar((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Inicializar EmailJS
    useEffect(() => {
        emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    }, []);

    const abrirModalCorreo = () => {
        setEmailDestino("");
        setMostrarModalCorreo(true);
    };

    const formatearCategoriasParaCorreo = () => {
        if (categorias.length === 0) return "No hay categorías registradas.";

        let texto = `LISTADO DE CATEGORÍAS\n\n`;
        texto += `Fecha: ${new Date().toLocaleDateString("es-NI")}\n`;
        texto += `Total de categorías: ${categorias.length}\n\n`;

        categorias.forEach((cat, index) => {
            texto += `${index + 1}. ${cat.nombre_categoria}\n`;
            if (cat.descripcion_categoria) {
                texto += `   Descripción: ${cat.descripcion_categoria}\n`;
            }
            texto += `\n`;
        });

        return texto;
    };

    const enviarCorreoCategorias = () => {
        if (!emailDestino.trim()) {
            setToast({
                mostrar: true,
                mensaje: "Por favor ingresa un correo destino.",
                tipo: "advertencia",
            });
            return;
        }

        setEnviandoCorreo(true);

        const mensaje = formatearCategoriasParaCorreo();

        const templateParams = {
            to_name: "Administrador",
            user_email: emailDestino,
            message: mensaje,
            fecha_envio: new Date().toLocaleDateString("es-NI")
        };

        emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams
        )
            .then(() => {
                setToast({
                    mostrar: true,
                    mensaje: "Correo enviado correctamente.",
                    tipo: "exito",
                });
                setMostrarModalCorreo(false);
                setEmailDestino("");
            })
            .catch((error) => {
                console.error("Error EmailJS:", error);
                setToast({
                    mostrar: true,
                    mensaje: "Error al enviar el correo.",
                    tipo: "error",
                });
            })
            .finally(() => {
                setEnviandoCorreo(false);
            });
    };


    return (
        <Container className="mt-3">
            {/* CABECERA ÚNICA: Título y Botones */}
            <Row className="align-items-center mb-3">
                <Col xs={12} md={6} className="d-flex align-items-center mb-2 mb-md-0">
                    <h3 className="mb-0">
                        <i className="bi-bookmark-plus-fill me-2"></i> Categorías
                    </h3>
                </Col>
                <Col xs={12} md={6} className="text-md-end">
                    <Button variant="primary" onClick={abrirModalCorreo} size="md" className="me-2">
                        <i className="bi bi-envelope"></i>
                        <span className="d-none d-sm-inline ms-2">Enviar por Correo</span>
                    </Button>
                    <Button onClick={() => setMostrarModal(true)} size="md">
                        <i className="bi-plus-lg"></i>
                        <span className="d-none d-sm-inline ms-2">Nueva Categoría</span>
                    </Button>
                </Col>
            </Row>

            <hr />

            {/* Spinner mientras se cargan las categorias */}
            {cargando && (
                <Row className="text-center my-5">
                    <Col>
                        <Spinner animation="border" variant="success" size="lg" />
                        <p className="mt-3 text-muted">Cargando categorias...</p>
                    </Col>
                </Row>
            )}

            {/* Cuadro de busqueda */}
            {!cargando && (
                <Row className="mb-4">
                    <Col md={6} lg={5}>
                        <CuadroBusquedas
                            textoBusqueda={textoBusqueda}
                            manejarCambioBusqueda={manejarBusqueda}
                            placeholder="Buscar por nombre o descripcion..."
                        />
                    </Col>
                </Row>
            )}

            {/* Mensajes de Alerta */}
            {!cargando && textoBusqueda.trim() && categoriasFiltradas.length === 0 && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="info" className="text-center">
                            <i className="bi bi-info-circle me-2"></i>
                            No se encontraron categorias que coincidan con "{textoBusqueda}".
                        </Alert>
                    </Col>
                </Row>
            )}

            {!cargando && categorias.length === 0 && (
                <Row className="text-center my-4">
                    <Col>
                        <Alert variant="warning">No hay categorías registradas aún.</Alert>
                    </Col>
                </Row>
            )}

            {/* Listas (Tarjeta/Tabla) */}
            {!cargando && categoriasFiltradas.length > 0 && (
                <>
                    <Row className="d-lg-none">
                        <Col xs={12}>
                            <TarjetaCategoria
                                categorias={categoriasFiltradas}
                                abrirModalEdicion={abrirModalEdicion}
                                abrirModalEliminacion={abrirModalEliminacion}
                                copiarCategoria={copiarCategoria}
                                generarQRImagen={generarQRImagen}
                            />
                        </Col>
                    </Row>
                    <Row className="d-none d-lg-block">
                        <Col lg={12}>
                            <TablaCategorias
                                categorias={categoriasPaginadas}
                                abrirModalEdicion={abrirModalEdicion}
                                abrirModalEliminacion={abrirModalEliminacion}
                                generarPDFCategoria={generarPDFCategoria}
                                copiarCategoria={copiarCategoria}
                                generarQRImagen={generarQRImagen}
                            />
                        </Col>
                    </Row>
                </>
            )}

            {/* Paginacion */}
            {categoriasFiltradas.length > 0 && (
                <Paginacion
                    registrosPorPagina={registrosPorPagina}
                    totalRegistros={categoriasFiltradas.length}
                    paginaActual={paginaActual}
                    establecerPaginaActual={establecerPaginaActual}
                    establecerRegistrosPorPagina={establecerRegistrosPorPagina}
                />
            )}

            {/* Modales y Notificaciones */}
            <ModalRegistroCategoria
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevaCategoria={nuevaCategoria}
                manejoCambioInput={manejoCambioInput}
                agregarCategoria={agregarCategoria}
            />

            <ModalEdicionCategoria
                mostrarModalEdicion={mostrarModalEdicion}
                setMostrarModalEdicion={setMostrarModalEdicion}
                categoriaEditar={categoriaEditar}
                manejoCambioInputEdicion={manejoCambioInputEdicion}
                actualizarCategoria={actualizarCategoria}
            />

            <ModalEliminacionCategoria
                mostrarModalEliminacion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                eliminarCategoria={eliminarCategoria}
                categoria={categoriaAEliminar}
            />

            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() => setToast({ ...toast, mostrar: false })}
            />

            <ModalEnvioCorreoCategorias
                mostrarModalCorreo={mostrarModalCorreo}
                setMostrarModalCorreo={setMostrarModalCorreo}
                emailDestino={emailDestino}
                setEmailDestino={setEmailDestino}
                enviandoCorreo={enviandoCorreo}
                enviarCorreoCategorias={enviarCorreoCategorias}
                totalCategorias={categorias.length}
            />

            <ModalQRProducto
                mostrar={mostrarModalQR}
                onHide={() => setMostrarModalQR(false)}
                producto={productoQR}
            />
        </Container>
    
    );
};

export default Categorias;