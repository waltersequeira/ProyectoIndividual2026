const { obtenerBaseQR, obtenerValorQRProducto } = require('../productos/qrProducto.cjs');

describe('Generación del valor QR para productos', () => {
  test('usa la IP de red cuando el navegador está en localhost', () => {
    const originalWindow = globalThis.window;

    globalThis.window = {
      location: { hostname: 'localhost', protocol: 'http:', port: '5173' },
    };

    expect(obtenerBaseQR()).toBe('http://192.168.1.32:4174');

    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  test('redirige a la información del producto y lleva datos iniciales para cargar rápido', () => {
    const producto = {
      id_producto: 1,
      nombre_producto: 'Café',
      precio_venta: 4.5,
      descripcion_producto: 'Café premium',
      url_imagen: 'https://example.test/cafe.png',
    };

    const valor = obtenerValorQRProducto(producto);

    expect(valor).toContain('/producto.html');
    expect(valor).toContain('id=1');
    expect(valor).toContain('nombre=Caf%C3%A9');
    expect(valor).toContain('precio=4.5');
    expect(valor).toContain('descripcion=Caf%C3%A9+premium');
    expect(valor).toContain('imagen=https%3A%2F%2Fexample.test%2Fcafe.png');
  });

  test('también redirige al detalle del producto cuando no hay imagen', () => {
    const producto = {
      id_producto: 7,
      nombre_producto: 'Pan',
      precio_venta: 4.5,
    };

    const valor = obtenerValorQRProducto(producto);

    expect(valor).toContain('/producto.html');
    expect(valor).toContain('id=7');
    expect(valor).not.toContain('producto:7');
  });
});
