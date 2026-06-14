export const obtenerBaseQR = () => {
  return "https://discosa-app.netlify.app";
};

const construirUrlDetalleProducto = (producto) => {
  const params = new URLSearchParams();
  if (producto.id_producto != null) params.set("id", String(producto.id_producto));

  if (producto.id_producto != null) {
    params.set("id", String(producto.id_producto));
  }

  if (producto.nombre_producto) {
    params.set("nombre", producto.nombre_producto);
  }

  if (producto.precio_venta != null) {
    params.set("precio", String(producto.precio_venta));
  }

  if (producto.descripcion_producto) {
    params.set("descripcion", producto.descripcion_producto);
  }

  if (producto.categoria_producto) {
    params.set("categoria", producto.categoria_producto);
  }

  if (producto.url_imagen) {
    params.set("imagen", producto.url_imagen);
  }

  const query = params.toString();
  return `${obtenerBaseQR()}/producto${query ? `?${query}` : ""}`;
};

export const obtenerValorQRProducto = (producto = {}) => {
  if (producto.id_producto != null) {
    return construirUrlDetalleProducto(producto);
  }

  const urlImagen = typeof producto.url_imagen === "string" ? producto.url_imagen.trim() : "";

  if (urlImagen) {
    return urlImagen;
  }

  if (producto.id_categoria != null) {
    const nombre = producto.nombre_categoria || "Categoría sin nombre";
    const descripcion = producto.descripcion_categoria || "Sin descripción";
    return `categoria:${producto.id_categoria}|nombre:${nombre}|descripcion:${descripcion}`;
  }

  const id = producto.id_producto ?? "sin-id";
  const nombre = producto.nombre_producto || "Producto sin nombre";
  const precio = producto.precio_venta != null ? String(producto.precio_venta) : "sin precio";

  return `producto:${id}|nombre:${nombre}|precio:${precio}`;
};
