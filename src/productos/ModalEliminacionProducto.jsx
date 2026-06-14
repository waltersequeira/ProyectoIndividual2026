import React from "react";
import { Modal, Button } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig"; // Importa supabase aquí

const ModalEliminacionProducto = ({
    mostrarModalEliminacion,
    setMostrarModalEliminacion,
    productoAEliminar,
    setToast,
    cargarProductos
}) => {

    const confirmarEliminacion = async () => {
        try {
            const { error } = await supabase
                .from("productos")
                .delete()
                .eq("id_producto", productoAEliminar.id_producto);

            if (error) throw error;

            setToast({ mostrar: true, mensaje: "Producto eliminado", tipo: "exito" });

            await cargarProductos();

        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al eliminar", tipo: "error" });
        } finally {
            setMostrarModalEliminacion(false);
        }
    };

    return (
        <Modal show={mostrarModalEliminacion} onHide={() => setMostrarModalEliminacion(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {productoAEliminar ? (
                    <>
                        ¿Estás seguro de que deseas eliminar el producto <strong>{productoAEliminar.nombre_producto}</strong>?
                    </>
                ) : (
                    <p>Cargando información del producto...</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setMostrarModalEliminacion(false)}>Cancelar</Button>
                <Button variant="danger" onClick={confirmarEliminacion}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEliminacionProducto;