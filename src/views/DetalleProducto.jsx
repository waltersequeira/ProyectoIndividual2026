import React, { useEffect, useMemo, useState } from "react";
import { Badge, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const DetalleProducto = () => {
  const { id_producto } = useParams();
  const location = useLocation();

  const productoInicial = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || id_producto;

    if (!id && !params.get("nombre")) {
      return null;
    }

    return {
      id_producto: Number(id) || null,
      nombre_producto: params.get("nombre") || "Producto",
      descripcion_producto: params.get("descripcion") || "",
      precio_venta: params.get("precio") ? Number(params.get("precio")) : 0,
      categoria_producto: params.get("categoria") || "Sin categoría",
      url_imagen: params.get("imagen") || "",
    };
  }, [id_producto, location.search]);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tieneDatosQR = Boolean(
    params.get("nombre") ||
    params.get("descripcion") ||
    params.get("precio") ||
    params.get("imagen") ||
    params.get("categoria")
  );

  const [producto, setProducto] = useState(productoInicial);
  const [cargando, setCargando] = useState(!productoInicial);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setCargando(!productoInicial);
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .eq("id_producto", Number(id_producto || productoInicial?.id_producto))
          .single();

        if (error) throw error;
        setProducto((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Error al cargar el producto:", err);
        setError("No se pudo cargar el producto seleccionado.");
      } finally {
        setCargando(false);
      }
    };

    if (tieneDatosQR) {
      setProducto(productoInicial);
      setCargando(false);
      setError("");
      return;
    }

    if (id_producto || productoInicial?.id_producto) {
      cargarProducto();
    }
  }, [id_producto, productoInicial, tieneDatosQR]);

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 mb-0">Cargando detalle del producto...</p>
      </Container>
    );
  }

  if (error || !producto) {
    return (
      <Container className="py-5">
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center text-danger">
            {error || "No existe un producto con ese identificador."}
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0 overflow-hidden">
        <Row className="g-0 align-items-stretch">
          <Col md={5} className="bg-light p-3 d-flex align-items-center justify-content-center">
            {producto.url_imagen ? (
              <img
                src={producto.url_imagen}
                alt={producto.nombre_producto}
                style={{ maxHeight: "320px", width: "100%", objectFit: "contain" }}
              />
            ) : (
              <div className="text-muted">Sin imagen disponible</div>
            )}
          </Col>
          <Col md={7} className="p-4">
            <Badge bg="primary" className="mb-3">Producto</Badge>
            <h2 className="mb-3">{producto.nombre_producto}</h2>
            <p className="text-muted mb-3">{producto.descripcion_producto || "Sin descripción"}</p>
            <p className="h4 text-success mb-3">S/ {Number(producto.precio_venta || 0).toFixed(2)}</p>
            <p className="small text-secondary mb-1">ID: {producto.id_producto}</p>
            <p className="small text-secondary mb-0">Categoría: {producto.categoria_producto || "Sin categoría"}</p>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default DetalleProducto;
