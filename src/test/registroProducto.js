function registroProducto(producto) {
    const { id_categoria, nombre_producto, descripcion, precio_venta, stock } = producto;

    // Campos obligaorios
    if (!nombre_producto || !id_categoria || precio_venta === '' || stock === '') {
        return { valido: false, mensaje: "Completa todos los campos requeridos." };
    }

    const regexNombre = /^[A-Za-zAEIOUaeiou\s]+$/;
    if (!regexNombre.test(nombre_producto)) {
        return { valido: false, mensaje: "El nombre del producto solo debe contener letras." };
    }

    if (isNaN(precio_venta) || Number(precio_venta) < 0) {
        return { valido: false, mensaje: "El precio debe ser un numero positivo." };
    }

    if (isNaN(stock) || Number(stock) < 0) {
        return { valido: false, mensaje: "El stock debe ser un numero positivo." };
    }

    if (descripcion && descripcion.length > 255) {
        return { valido: false, mensaje: "La descripcion no debe exceder 255 caracteres." };
    }

    return { valido: true };

}

module.exports = registroProducto;