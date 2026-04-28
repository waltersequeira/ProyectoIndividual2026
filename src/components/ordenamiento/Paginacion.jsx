import React from "react";
import Pagination from "react-bootstrap/Pagination";
import { Row, Col, Form } from "react-bootstrap";

const Paginacion = ({
    registrosPorPagina,
    totalRegistros,
    paginaActual,
    establecerPaginaActual,
    establecerRegistrosPorPagina
}) => {

    // Cálculo del total de páginas
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

    // Función para cambiar de página
    const cambiarPagina = (numeroPagina) => {
        if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
            establecerPaginaActual(numeroPagina);
        }
    };

    // Función para cambiar la cantidad de registros por página (Actividad 13)
    const cambiarCantidadRegistros = (evento) => {
        establecerRegistrosPorPagina(Number(evento.target.value));
        establecerPaginaActual(1); // Reiniciar a la primera página al cambiar el tamaño
    };

    // Lógica para generar los botones numéricos
    const elementosPaginacion = [];
    const maximoPaginasAMostrar = 3;

    // CORRECCIÓN: Se cambió "Marth" por "Math" (Error reportado)
    let paginaInicio = Math.max(
        1,
        paginaActual - Math.floor(maximoPaginasAMostrar / 2)
    );

    let paginaFin = Math.min(
        totalPaginas,
        paginaInicio + maximoPaginasAMostrar - 1
    );

    // Ajuste si estamos cerca del final para mantener el número de botones
    if (paginaFin - paginaInicio + 1 < maximoPaginasAMostrar) {
        paginaInicio = Math.max(
            1,
            paginaFin - maximoPaginasAMostrar + 1
        );
    }

    for (let numeroPagina = paginaInicio; numeroPagina <= paginaFin; numeroPagina++) {
        elementosPaginacion.push(
            <Pagination.Item
                key={numeroPagina}
                active={numeroPagina === paginaActual}
                onClick={() => cambiarPagina(numeroPagina)}
            >
                {numeroPagina}
            </Pagination.Item>
        );
    }

    return (
        <Row className="mt-1 align-items-center">
            {/* Selector de cantidad de registros */}
            <Col xs="auto">
                <Form.Group className="d-flex align-items-center">
                    <Form.Label className="me-2 mb-0 d-none d-sm-block">Mostrar:</Form.Label>
                    <Form.Select
                        size="sm"
                        value={registrosPorPagina}
                        onChange={cambiarCantidadRegistros}
                        style={{ width: '80px' }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={500}>500</option>
                    </Form.Select>
                </Form.Group>
            </Col>

            {/* Controles de navegación */}
            <Col className="d-flex justify-content-center">
                <Pagination className="shadow-sm mt-2">
                    <Pagination.First
                        onClick={() => cambiarPagina(1)}
                        disabled={paginaActual === 1}
                    />
                    <Pagination.Prev
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                    />

                    {paginaInicio > 1 && <Pagination.Ellipsis disabled />}

                    {elementosPaginacion}

                    {paginaFin < totalPaginas && <Pagination.Ellipsis disabled />}

                    <Pagination.Next
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas || totalPaginas === 0}
                    />
                    <Pagination.Last
                        onClick={() => cambiarPagina(totalPaginas)}
                        disabled={paginaActual === totalPaginas || totalPaginas === 0}
                    />
                </Pagination>
            </Col>
        </Row>
    );
};

export default Paginacion;