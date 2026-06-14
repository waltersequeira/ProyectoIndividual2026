import React, { useState, useCallback, useEffect } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaProducto = ({
    producto,
    abrirModalEdicion,
    abrirModalEliminacion,
    copiarProducto,
    generarQRImagen
}) => {

    const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

    const manejarTeclaEscape = useCallback((evento) => {
        if (evento.key === "Escape") setIdTarjetaActiva(null);
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", manejarTeclaEscape);
        return () => window.removeEventListener("keydown", manejarTeclaEscape);
    }, [manejarTeclaEscape]);

    const alternarTarjetaActiva = (id) => {
        setIdTarjetaActiva((anterior) => (anterior === id ? null : id));
    };

    if (!producto) return null;

    const tarjetaActiva = idTarjetaActiva === producto.id_producto;

    return (
        <Card
            key={producto.id_producto}
            className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-producto-contenedor"
            onClick={() => alternarTarjetaActiva(producto.id_producto)}
            tabIndex={0}
            onKeyDown={(evento) => {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    alternarTarjetaActiva(producto.id_producto);
                }
            }}
            aria-label={`Producto ${producto.nombre_producto}`}
        >
                                <Card.Body
                                    className={`p-2 tarjeta-producto-cuerpo ${tarjetaActiva
                                        ? "tarjeta-producto-activo"
                                        : "tarjeta-producto-cuerpo-inactivo"
                                        }`}
                                >
                                    <Row className="align-items-center gx-3">
                                        <Col xs={2} className="px-2">
                                            <div
                                                className="bg-light d-flex align-items-center justify-content-center rounded tarjeta-producto-placeholder-imagen"
                                            >
                                                <i className="bi bi-bookmark text-muted fs-3"></i>
                                            </div>
                                        </Col>

                                        <Col xs={5} className="text-start">
                                            <div className="fw-semibold text-truncate">
                                                {producto.nombre_producto}
                                            </div>
                                            <div className="small text-muted text-truncate">
                                                {producto.descripcion_producto}
                                            </div>
                                        </Col>

                                        <Col
                                            xs={5}
                                            className="d-flex flex-column align-items-end justify-content-center text-end"
                                        >
                                            <div className="fw-semibold small">Activa</div>
                                        </Col>
                                    </Row>
                                </Card.Body>

                                {tarjetaActiva && (
                                    <div
                                        role="dialog"
                                        aria-modal="true"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIdTarjetaActiva(null);
                                        }}
                                        className="tarjeta-producto-capa"

                                    >
                                        <div
                                            className="d-flex gap-2 tarjeta-producto-botones-capa"
                                            onClick={(e) => e.stopPropagation()}

                                        >

                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() => {
                                                    abrirModalEdicion(producto);
                                                    setIdTarjetaActiva(null);
                                                }}
                                                aria-label={`Editar ${producto.nombre_producto}`}

                                            >
                                                <i className="bi bi-pencil"></i>
                                            </Button>

                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    abrirModalEliminacion(producto);
                                                    setIdTarjetaActiva(null);
                                                }}
                                                aria-label={`Eliminar ${producto.nombre_producto}`}

                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>

                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="m-1"
                                                onClick={() => copiarProducto(producto)}
                                                title="Copiar al portapapeles"
                                            >
                                                <i className="bi bi-clipboard"></i>
                                            </Button>

                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => {
                                                    generarQRImagen(producto);
                                                    setIdTarjetaActiva(null);
                                                }}
                                                title="Generar codigo QR de la imagen"
                                            >
                                                <i className="bi bi-qr-code"></i>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
    );
};

export default TarjetaProducto;