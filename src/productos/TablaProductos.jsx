import React from "react";
import { Table, Button, Image, Badge, Card, Row, Col } from "react-bootstrap";

const TablaProductos = ({
    productos,
    categorias,
    setProductoEditar,
    setMostrarModalEdicion,
    abrirModalEdicion,
    setProductoAEliminar,
    setMostrarModalEliminacion,
    abrirModalEliminacion,
    generarPDFProducto,
    copiarProducto,
    generarQRImagen
}) => {

    const obtenerNombreCategoria = (id) => {
        const categoria = categorias.find(cat => cat.id_categoria === id);
        return categoria ? categoria.nombre_categoria : "Sin categoría";
    };

    return (
        <>
            {/* ================= VISTA ESCRITORIO ================= */}
            <div className="table-responsive shadow-sm rounded">
                <Table hover className="align-middle bg-white m-0">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center">Imagen</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Descripción</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((producto) => (
                            <tr key={producto.id_producto}>
                                <td className="text-center" style={{ width: '100px' }}>
                                    <Image
                                        src={producto.url_imagen}
                                        alt={producto.nombre_producto}
                                        rounded
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                                    />
                                </td>
                                <td>
                                    <div className="fw-bold">{producto.nombre_producto}</div>
                                    <small className="text-muted">ID: {producto.id_producto}</small>
                                </td>
                                <td>
                                    <Badge bg="info" className="text-dark">
                                        {obtenerNombreCategoria(producto.categoria_producto)}
                                    </Badge>
                                </td>
                                <td className="fw-bold text-success">
                                    S/ {parseFloat(producto.precio_venta).toFixed(2)}
                                </td>
                                <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                    {producto.descripcion_producto || "Sin descripción"}
                                </td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center gap-2">
                                        {/* Botón Editar - Limpio */}
                                        <Button variant="outline-warning" size="sm" onClick={() => abrirModalEdicion(producto)}>
                                            <i className="bi bi-pencil"></i>
                                        </Button>

                                        {/* Botón Eliminar */}
                                        <Button variant="outline-danger" size="sm" onClick={() => {
                                            abrirModalEliminacion(producto);
                                        }}>
                                            <i className="bi bi-trash"></i>
                                        </Button>

                                        <Button variant="outline-info" size="sm" onClick={() => {
                                            const productoConNombre = {
                                                ...producto,
                                                nombre_categoria_texto: obtenerNombreCategoria(producto.categoria_producto)
                                            };
                                            generarQRImagen(productoConNombre);
                                        }}>
                                            <i className="bi bi-qr-code"></i>
                                        </Button>

                                        <Button variant="outline-success" size="sm" onClick={() => copiarProducto(producto)}>
                                            <i className="bi bi-clipboard"></i>
                                        </Button>

                                        <Button variant="outline-primary" size="sm" onClick={() => generarPDFProducto(producto)}>
                                            <i className="bi bi-file-earmark-pdf"></i>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* ================= VISTA MÓVIL ================= */}
            <div className="d-lg-none mt-3">
                <Row className="g-3">
                    {productos.map((producto) => (
                        <Col xs={12} key={producto.id_producto}>
                            <Card className="shadow-sm border-0 rounded-3">
                                <Card.Body>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <Image src={producto.url_imagen} rounded style={{ width: '65px', height: '65px', objectFit: 'cover' }} />
                                        <div className="flex-grow-1">
                                            <h6 className="mb-0 fw-bold">{producto.nombre_producto}</h6>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2 border-top pt-2">
                                        <Button variant="primary" size="sm" onClick={() => generarPDFProducto(producto)}><i className="bi bi-file-earmark-pdf"></i></Button>

                                        {/* Botón Editar - Limpio */}
                                        <Button variant="warning" size="sm" onClick={() => abrirModalEdicion(producto)}>
                                            <i className="bi bi-pencil"></i>
                                        </Button>

                                        <Button variant="danger" size="sm" onClick={() => {
                                            abrirModalEliminacion(producto);
                                        }}><i className="bi bi-trash"></i></Button>

                                        <Button variant="outline-success" size="sm" onClick={() => copiarProducto(producto)}><i className="bi bi-clipboard"></i></Button>
                                        <Button variant="outline-info" size="sm" onClick={() => generarQRImagen(producto)}><i className="bi bi-qr-code"></i></Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
};

export default TablaProductos;