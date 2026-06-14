import React from "react";
import { Modal, Button } from "react-bootstrap";
import QRCode from "react-qr-code";
import { obtenerValorQRProducto } from "./qrProducto.js";

const ModalQRProducto = ({
  mostrar,
  onHide,
  producto
}) => {
  if (!producto) return null;

  const valorQR = obtenerValorQRProducto(producto);
  const tieneImagen = Boolean(producto.url_imagen && producto.url_imagen.trim());
  const tipo = producto.id_categoria != null ? "categoría" : "producto";


  console.log("Datos del producto recibidos:", producto);
  console.log("Valor generado para el QR:", valorQR);

  if (!valorQR) {
    console.error("¡ERROR! El valor del QR está vacío, revisa la función obtenerValorQRProducto");
  }

  return (
    <Modal show={mostrar} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">
          QR - {producto.nombre_producto || producto.nombre_categoria || "Producto"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        {valorQR ? (
          <QRCode
            value={valorQR}
            size={230}
            className="mx-auto shadow-sm"
          />
        ) : (
          <div className="alert alert-danger">
            Error al generar el código QR.
          </div>
        )}

        <p className="text-muted mt-3 small mb-1">
          {tipo === "producto"
            ? "Escanea para abrir la información del producto"
            : tieneImagen
              ? `Escanea para abrir la imagen de la ${tipo}`
              : `Escanea para ver la información de la ${tipo}`}
        </p>

        <p className="text-primary small">
          {producto.nombre_producto || producto.nombre_categoria || "Sin nombre"}
        </p>

        {!tieneImagen && (
          <p className="text-warning-emphasis small mb-0">
            Sin imagen disponible, pero la QR sigue funcionando con los datos del producto.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalQRProducto;