import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCategoria from "../categorias/ModalRegistroCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCategorias from "../categorias/TablaCategorias";
import ModalEdicionCategoria from "../categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../categorias/ModalEliminacionCategoria";

const Categorias = () => {

    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
    const [mostrarModal, setMostrarModal] = useState(false);

    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true); // Estado de carga inicial
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

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

    return (
        <Container className="mt-3">
            <Row className="align-items-center mb-3">
                <Col xs={9} sm={7} lg={7} className="d-flex align-items-center">
                    <h3 className="mb-0">
                        <i className="bi-bookmark-plus-fill me-2"></i> Categorias
                    </h3>
                </Col>
                <Col xs={3} sm={5} md={5} lg={5} className="text-end">
                    <Button
                        onClick={() => setMostrarModal(true)}
                        size="md"
                    >
                        <i className="bi-plus-lg"></i>
                        <span className="d-none d-sm-inline ms-2">Nueva Categoria</span>
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

            {/* Lista de categorias cargadas */}
            {!cargando && categorias.length > 0 && (
                <Row>
                    <Col lg={12} className="d-none d-lg-block">
                        <TablaCategorias
                            categorias={categorias}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                        />
                    </Col>
                </Row>
            )}

            {/* Modal de Registro */}
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

            {/* Notificacion */}
            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() => setToast({ ...toast, mostrar: false })}
            />

        </Container>
    );
};

export default Categorias;