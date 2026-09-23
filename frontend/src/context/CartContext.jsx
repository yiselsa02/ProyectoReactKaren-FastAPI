import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { jsPDF } from 'jspdf'
import { API_URL } from '../config'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'cellworld_cart'

// ============================================================
// USUARIO
// ============================================================

function obtenerUsuarioActual() {
  try {
    const usuarioGuardado = localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      return null
    }

    return JSON.parse(usuarioGuardado)
  } catch (error) {
    console.error('Error leyendo usuario:', error)
    return null
  }
}

function obtenerIdUsuario(usuario) {
  if (!usuario || typeof usuario !== 'object') {
    return null
  }

  const id =
    usuario.id_usuario ??
    usuario.usuario_id ??
    usuario.id ??
    usuario.user_id

  const numero = Number(id)

  if (!Number.isInteger(numero) || numero <= 0) {
    return null
  }

  return numero
}

function crearClaveCarrito(usuarioId) {
  return `${CART_STORAGE_KEY}_${usuarioId}`
}

// ============================================================
// NORMALIZAR PRODUCTO
// ============================================================

function normalizarProducto(producto) {
  if (!producto || typeof producto !== 'object') {
    return null
  }

  const id =
    producto.id_producto ??
    producto.producto_id ??
    producto.id

  const idNumero = Number(id)

  if (
    !Number.isInteger(idNumero) ||
    idNumero <= 0
  ) {
    console.warn(
      'Producto rechazado del carrito porque no tiene un ID válido:',
      producto
    )

    return null
  }

  const nombre =
    producto.nombre_producto ??
    producto.nombre ??
    producto.name ??
    'Producto'

  const precio =
    producto.precio ??
    producto.precio_unitario ??
    producto.precio_venta ??
    producto.price ??
    0

  const imagen =
    producto.imagen ??
    producto.imagen_url ??
    producto.url_imagen ??
    producto.image ??
    ''

  const precioNumero = Number(precio)

  return {
    ...producto,

    id_producto: idNumero,

    nombre_producto: String(nombre),

    precio: Number.isFinite(precioNumero)
      ? precioNumero
      : 0,

    imagen,
  }
}

// ============================================================
// NORMALIZAR CARRITO
// ============================================================

function normalizarCarrito(carrito) {
  if (!Array.isArray(carrito)) {
    return []
  }

  return carrito
    .map((item) => {
      const producto = normalizarProducto(item)

      if (!producto) {
        return null
      }

      const cantidad = Number(item.cantidad)

      return {
        ...producto,

        cantidad:
          Number.isInteger(cantidad) && cantidad >= 1
            ? cantidad
            : 1,
      }
    })
    .filter(Boolean)
}

// ============================================================
// FUNCIONES PARA FACTURA
// ============================================================

function formatearPrecioFactura(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0)
}

function formatearFechaFactura(valor) {
  if (!valor) {
    return 'Fecha no disponible'
  }

  const fecha = new Date(valor)

  if (Number.isNaN(fecha.getTime())) {
    return String(valor)
  }

  return fecha.toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function obtenerNombreClienteFactura(usuario) {
  if (!usuario) {
    return 'Cliente CellWorld'
  }

  return (
    usuario.nombre_completo ||
    usuario.nombres ||
    usuario.nombre ||
    usuario.usuario ||
    'Cliente CellWorld'
  )
}

function obtenerCorreoClienteFactura(usuario) {
  if (!usuario) {
    return 'No registrado'
  }

  return (
    usuario.correo ||
    usuario.email ||
    usuario.correo_electronico ||
    'No registrado'
  )
}

function obtenerDetallesFactura(pedido) {
  if (!pedido || typeof pedido !== 'object') {
    return []
  }

  const detalles =
    pedido.detalles ||
    pedido.detalle_pedido ||
    pedido.detalle_pedidos ||
    pedido.items ||
    []

  return Array.isArray(detalles)
    ? detalles
    : []
}

// ============================================================
// GENERADOR ÚNICO DE FACTURA PDF
// ============================================================
//
// Esta función se exporta para que PanelCliente pueda utilizar
// exactamente el mismo generador.
//
// ============================================================

export function generarFacturaPDF(pedido, usuario = null) {
  if (!pedido || typeof pedido !== 'object') {
    throw new Error(
      'No se recibió la información del pedido.'
    )
  }

  const doc = new jsPDF()

  const margen = 18

  const anchoPagina =
    doc.internal.pageSize.getWidth()

  const altoPagina =
    doc.internal.pageSize.getHeight()

  const detalles =
    obtenerDetallesFactura(pedido)

  const nombreCliente =
    obtenerNombreClienteFactura(usuario)

  const correoCliente =
    obtenerCorreoClienteFactura(usuario)

  const subtotalCalculado =
    detalles.reduce(
      (acumulado, item) => {
        const precio =
          Number(
            item.precio_unitario ??
            item.precio ??
            0
          ) || 0

        const cantidad =
          Number(item.cantidad) || 0

        return (
          acumulado +
          precio * cantidad
        )
      },
      0
    )

  const descuento =
    Number(pedido.descuento) || 0

  const iva =
    Number(pedido.iva) || 0

  const subtotal =
    subtotalCalculado

  const total =
    Number(pedido.total) ||
    Math.max(
      subtotal - descuento + iva,
      0
    )

  const idPedido =
    pedido.id_pedido ??
    pedido.id ??
    pedido.pedido_id ??
    'N/A'

  const estadoOriginal =
    String(
      pedido.estado || 'pagado'
    )

  const estado =
    estadoOriginal
      .charAt(0)
      .toUpperCase() +
    estadoOriginal.slice(1)

  let y = 0

  // ==========================================================
  // ENCABEZADO
  // ==========================================================

  doc.setFillColor(
    25,
    118,
    210
  )

  doc.rect(
    0,
    0,
    anchoPagina,
    40,
    'F'
  )

  doc.setTextColor(
    255,
    255,
    255
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(25)

  doc.text(
    'CellWorld',
    margen,
    18
  )

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(10)

  doc.text(
    'Tecnología y soluciones móviles',
    margen,
    27
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(11)

  doc.text(
    'FACTURA',
    anchoPagina - margen,
    17,
    {
      align: 'right',
    }
  )

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(9)

  doc.text(
    `No. ${idPedido}`,
    anchoPagina - margen,
    25,
    {
      align: 'right',
    }
  )

  y = 52

  // ==========================================================
  // INFORMACIÓN DE COMPRA
  // ==========================================================

  doc.setTextColor(
    35,
    35,
    35
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(11)

  doc.text(
    'INFORMACIÓN DE LA COMPRA',
    margen,
    y
  )

  y += 9

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(10)

  doc.setTextColor(
    70,
    70,
    70
  )

  doc.text(
    `Factura #${idPedido}`,
    margen,
    y
  )

  doc.text(
    `Fecha: ${formatearFechaFactura(
      pedido.creado_en
    )}`,
    margen,
    y + 7
  )

  doc.text(
    `Cliente: ${nombreCliente}`,
    margen,
    y + 14
  )

  doc.text(
    `Correo: ${correoCliente}`,
    margen,
    y + 21
  )

  // Estado a la derecha

  const cajaEstadoX =
    anchoPagina - margen - 45

  const cajaEstadoY =
    y - 5

  doc.setFillColor(
    235,
    247,
    239
  )

  doc.roundedRect(
    cajaEstadoX,
    cajaEstadoY,
    45,
    12,
    3,
    3,
    'F'
  )

  doc.setTextColor(
    35,
    130,
    70
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(9)

  doc.text(
    estado,
    cajaEstadoX + 22.5,
    cajaEstadoY + 7.5,
    {
      align: 'center',
    }
  )

  y += 36

  // ==========================================================
  // DETALLE DE PRODUCTOS
  // ==========================================================

  doc.setTextColor(
    35,
    35,
    35
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(11)

  doc.text(
    'DETALLE DE PRODUCTOS',
    margen,
    y
  )

  y += 8

  const anchoTabla =
    anchoPagina - margen * 2

  const xProducto =
    margen + 2

  const xCantidad =
    113

  const xPrecio =
    142

  const xTotal =
    178

  doc.setFillColor(
    240,
    243,
    247
  )

  doc.roundedRect(
    margen,
    y - 5,
    anchoTabla,
    10,
    2,
    2,
    'F'
  )

  doc.setTextColor(
    55,
    55,
    55
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(9)

  doc.text(
    'Producto',
    xProducto,
    y + 1
  )

  doc.text(
    'Cant.',
    xCantidad,
    y + 1
  )

  doc.text(
    'Precio',
    xPrecio,
    y + 1
  )

  doc.text(
    'Total',
    xTotal,
    y + 1
  )

  y += 12

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(9)

  detalles.forEach(
    (item) => {
      const nombre =
        item.nombre_producto ||
        item.nombre ||
        'Producto'

      const cantidad =
        Number(item.cantidad) || 0

      const precio =
        Number(
          item.precio_unitario ??
          item.precio ??
          0
        ) || 0

      const totalProducto =
        precio * cantidad

      // Salto de página
      if (
        y >
        altoPagina - 55
      ) {
        doc.addPage()

        y = 22

        doc.setFont(
          'helvetica',
          'bold'
        )

        doc.setFontSize(11)

        doc.text(
          'DETALLE DE PRODUCTOS',
          margen,
          y
        )

        y += 12

        doc.setFont(
          'helvetica',
          'normal'
        )

        doc.setFontSize(9)
      }

      const nombreTexto =
        String(nombre)

      const nombreCorto =
        nombreTexto.length > 43
          ? `${nombreTexto.substring(
              0,
              40
            )}...`
          : nombreTexto

      doc.setTextColor(
        60,
        60,
        60
      )

      doc.text(
        nombreCorto,
        xProducto,
        y
      )

      doc.text(
        String(cantidad),
        xCantidad + 3,
        y
      )

      doc.text(
        formatearPrecioFactura(
          precio
        ),
        xPrecio,
        y
      )

      doc.text(
        formatearPrecioFactura(
          totalProducto
        ),
        xTotal,
        y
      )

      y += 8

      doc.setDrawColor(
        220,
        220,
        220
      )

      doc.line(
        margen,
        y - 4,
        anchoPagina - margen,
        y - 4
      )
    }
  )

  // ==========================================================
  // TOTALES
  // ==========================================================

  y += 8

  if (
    y >
    altoPagina - 75
  ) {
    doc.addPage()
    y = 25
  }

  const xEtiqueta = 126
  const xValor = 178

  doc.setTextColor(
    70,
    70,
    70
  )

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(10)

  doc.text(
    'Subtotal:',
    xEtiqueta,
    y
  )

  doc.text(
    formatearPrecioFactura(
      subtotal
    ),
    xValor,
    y
  )

  y += 8

  if (descuento > 0) {
    doc.text(
      'Descuento:',
      xEtiqueta,
      y
    )

    doc.text(
      `-${formatearPrecioFactura(
        descuento
      )}`,
      xValor,
      y
    )

    y += 8
  }

  if (iva > 0) {
    doc.text(
      'IVA:',
      xEtiqueta,
      y
    )

    doc.text(
      formatearPrecioFactura(
        iva
      ),
      xValor,
      y
    )

    y += 8
  }

  doc.setDrawColor(
    25,
    118,
    210
  )

  doc.line(
    xEtiqueta,
    y + 2,
    anchoPagina - margen,
    y + 2
  )

  y += 12

  doc.setTextColor(
    25,
    118,
    210
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(14)

  doc.text(
    'TOTAL:',
    xEtiqueta,
    y
  )

  doc.text(
    formatearPrecioFactura(
      total
    ),
    xValor,
    y
  )

  // ==========================================================
  // PIE DE FACTURA
  // ==========================================================

  const pieY =
    altoPagina - 27

  doc.setDrawColor(
    220,
    220,
    220
  )

  doc.line(
    margen,
    pieY - 8,
    anchoPagina - margen,
    pieY - 8
  )

  doc.setTextColor(
    105,
    105,
    105
  )

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(9)

  doc.text(
    'Gracias por comprar en CellWorld.',
    anchoPagina / 2,
    pieY,
    {
      align: 'center',
    }
  )

  doc.setFontSize(8)

  doc.text(
    'Comprobante generado digitalmente.',
    anchoPagina / 2,
    pieY + 7,
    {
      align: 'center',
    }
  )

  // ==========================================================
  // DESCARGAR
  // ==========================================================

  doc.save(
    `Factura_CellWorld_${idPedido}.pdf`
  )
}

// ============================================================
// PROVIDER
// ============================================================

export function CartProvider({
  children,
}) {
  const [carrito, setCarrito] =
    useState([])

  const [usuarioId, setUsuarioId] =
    useState(null)

  const [comprando, setComprando] =
    useState(false)

  // ============================================================
  // CARGAR CARRITO DEL USUARIO
  // ============================================================

  const cargarCarritoUsuario =
    useCallback(() => {
      const usuario =
        obtenerUsuarioActual()

      const id =
        obtenerIdUsuario(usuario)

      setUsuarioId(id)

      if (!id) {
        setCarrito([])
        return
      }

      const clave =
        crearClaveCarrito(id)

      try {
        const carritoGuardado =
          localStorage.getItem(clave)

        if (!carritoGuardado) {
          setCarrito([])
          return
        }

        const carritoParseado =
          JSON.parse(carritoGuardado)

        setCarrito(
          normalizarCarrito(
            carritoParseado
          )
        )
      } catch (error) {
        console.error(
          'Error cargando carrito:',
          error
        )

        setCarrito([])
      }
    }, [])

  useEffect(() => {
    cargarCarritoUsuario()
  }, [cargarCarritoUsuario])

  // ============================================================
  // CAMBIO DE USUARIO
  // ============================================================

  useEffect(() => {
    const manejarCambioUsuario =
      () => {
        cargarCarritoUsuario()
      }

    window.addEventListener(
      'usuarioCambio',
      manejarCambioUsuario
    )

    return () => {
      window.removeEventListener(
        'usuarioCambio',
        manejarCambioUsuario
      )
    }
  }, [cargarCarritoUsuario])

  // ============================================================
  // GUARDAR CARRITO
  // ============================================================

  useEffect(() => {
    if (!usuarioId) {
      return
    }

    const clave =
      crearClaveCarrito(usuarioId)

    try {
      localStorage.setItem(
        clave,
        JSON.stringify(carrito)
      )
    } catch (error) {
      console.error(
        'Error guardando carrito:',
        error
      )
    }
  }, [carrito, usuarioId])

  // ============================================================
  // AGREGAR AL CARRITO
  // ============================================================

  const agregarAlCarrito =
    useCallback(
      (producto) => {
        const usuario =
          obtenerUsuarioActual()

        const idUsuario =
          obtenerIdUsuario(usuario)

        if (!idUsuario) {
          console.warn(
            'No se puede agregar al carrito sin iniciar sesión.'
          )

          return {
            ok: false,
            message:
              'Debes iniciar sesión para agregar productos al carrito.',
          }
        }

        const productoNormalizado =
          normalizarProducto(producto)

        if (!productoNormalizado) {
          return {
            ok: false,
            message:
              'Este producto no está disponible para compra.',
          }
        }

        setUsuarioId(idUsuario)

        setCarrito(
          (carritoActual) => {
            const existente =
              carritoActual.find(
                (item) =>
                  Number(
                    item.id_producto
                  ) ===
                  Number(
                    productoNormalizado.id_producto
                  )
              )

            if (existente) {
              return carritoActual.map(
                (item) =>
                  Number(
                    item.id_producto
                  ) ===
                  Number(
                    productoNormalizado.id_producto
                  )
                    ? {
                        ...item,
                        cantidad:
                          Number(
                            item.cantidad
                          ) + 1,
                      }
                    : item
              )
            }

            return [
              ...carritoActual,
              {
                ...productoNormalizado,
                cantidad: 1,
              },
            ]
          }
        )

        return {
          ok: true,
          message:
            'Producto agregado al carrito.',
        }
      },
      []
    )

  // ============================================================
  // AGREGAR CANTIDAD ESPECÍFICA
  // ============================================================

  const agregarProducto =
    useCallback(
      (
        producto,
        cantidad = 1
      ) => {
        const usuario =
          obtenerUsuarioActual()

        const idUsuario =
          obtenerIdUsuario(usuario)

        if (!idUsuario) {
          return {
            ok: false,
            message:
              'Debes iniciar sesión para agregar productos al carrito.',
          }
        }

        const productoNormalizado =
          normalizarProducto(producto)

        if (!productoNormalizado) {
          return {
            ok: false,
            message:
              'Este producto no está disponible para compra.',
          }
        }

        const cantidadNumero =
          Number(cantidad)

        if (
          !Number.isInteger(
            cantidadNumero
          ) ||
          cantidadNumero <= 0
        ) {
          return {
            ok: false,
            message:
              'Cantidad inválida.',
          }
        }

        setUsuarioId(idUsuario)

        setCarrito(
          (carritoActual) => {
            const existente =
              carritoActual.find(
                (item) =>
                  Number(
                    item.id_producto
                  ) ===
                  Number(
                    productoNormalizado.id_producto
                  )
              )

            if (existente) {
              return carritoActual.map(
                (item) =>
                  Number(
                    item.id_producto
                  ) ===
                  Number(
                    productoNormalizado.id_producto
                  )
                    ? {
                        ...item,
                        cantidad:
                          Number(
                            item.cantidad
                          ) +
                          cantidadNumero,
                      }
                    : item
              )
            }

            return [
              ...carritoActual,
              {
                ...productoNormalizado,
                cantidad:
                  cantidadNumero,
              },
            ]
          }
        )

        return {
          ok: true,
          message:
            'Producto agregado al carrito.',
        }
      },
      []
    )

  // ============================================================
  // AUMENTAR
  // ============================================================

  const aumentarCantidad =
    useCallback(
      (idProducto) => {
        setCarrito(
          (carritoActual) =>
            carritoActual.map(
              (item) =>
                Number(
                  item.id_producto
                ) ===
                Number(idProducto)
                  ? {
                      ...item,
                      cantidad:
                        Number(
                          item.cantidad
                        ) + 1,
                    }
                  : item
            )
        )
      },
      []
    )

  // ============================================================
  // DISMINUIR
  // ============================================================

  const disminuirCantidad =
    useCallback(
      (idProducto) => {
        setCarrito(
          (carritoActual) =>
            carritoActual
              .map(
                (item) =>
                  Number(
                    item.id_producto
                  ) ===
                  Number(idProducto)
                    ? {
                        ...item,
                        cantidad:
                          Number(
                            item.cantidad
                          ) - 1,
                      }
                    : item
              )
              .filter(
                (item) =>
                  Number(
                    item.cantidad
                  ) > 0
              )
        )
      },
      []
    )

  // ============================================================
  // ELIMINAR
  // ============================================================

  const eliminarDelCarrito =
    useCallback(
      (idProducto) => {
        setCarrito(
          (carritoActual) =>
            carritoActual.filter(
              (item) =>
                Number(
                  item.id_producto
                ) !==
                Number(idProducto)
            )
        )
      },
      []
    )

  const removeItem =
    eliminarDelCarrito

  // ============================================================
  // ACTUALIZAR CANTIDAD
  // ============================================================

  const actualizarCantidad =
    useCallback(
      (
        idProducto,
        cantidad
      ) => {
        const cantidadNumero =
          Number(cantidad)

        if (
          !Number.isInteger(
            cantidadNumero
          ) ||
          cantidadNumero <= 0
        ) {
          setCarrito(
            (carritoActual) =>
              carritoActual.filter(
                (item) =>
                  Number(
                    item.id_producto
                  ) !==
                  Number(idProducto)
              )
          )

          return
        }

        setCarrito(
          (carritoActual) =>
            carritoActual.map(
              (item) =>
                Number(
                  item.id_producto
                ) ===
                Number(idProducto)
                  ? {
                      ...item,
                      cantidad:
                        cantidadNumero,
                    }
                  : item
            )
        )
      },
      []
    )

  const updateQuantity =
    actualizarCantidad

  // ============================================================
  // VACIAR
  // ============================================================

  const vaciarCarrito =
    useCallback(() => {
      setCarrito([])
    }, [])

  const clearCart =
    vaciarCarrito

  // ============================================================
  // LOGOUT
  // ============================================================

  const clearCartOnLogout =
    useCallback(() => {
      if (usuarioId) {
        const clave =
          crearClaveCarrito(
            usuarioId
          )

        localStorage.removeItem(
          clave
        )
      }

      setCarrito([])
      setUsuarioId(null)
    }, [usuarioId])

  // ============================================================
  // COUNT
  // ============================================================

  const count = useMemo(() => {
    return carrito.reduce(
      (total, item) =>
        total +
        Number(
          item.cantidad || 0
        ),
      0
    )
  }, [carrito])

  // ============================================================
  // TOTAL
  // ============================================================

  const total = useMemo(() => {
    return carrito.reduce(
      (suma, item) =>
        suma +
        Number(
          item.precio || 0
        ) *
          Number(
            item.cantidad || 0
          ),
      0
    )
  }, [carrito])

  const obtenerSubtotal =
    useCallback(
      (item) => {
        return (
          Number(
            item.precio || 0
          ) *
          Number(
            item.cantidad || 0
          )
        )
      },
      []
    )

  // ============================================================
  // CHECKOUT
  // ============================================================

  const checkout =
    useCallback(
      async () => {
        if (comprando) {
          return null
        }

        const usuario =
          obtenerUsuarioActual()

        const idUsuario =
          obtenerIdUsuario(usuario)

        if (!idUsuario) {
          throw new Error(
            'Debes iniciar sesión para realizar la compra.'
          )
        }

        if (
          !Array.isArray(carrito) ||
          carrito.length === 0
        ) {
          throw new Error(
            'El carrito está vacío.'
          )
        }

        const token =
          localStorage.getItem(
            'token'
          )

        if (!token) {
          throw new Error(
            'Tu sesión ha expirado. Inicia sesión nuevamente.'
          )
        }

        // ======================================================
        // VALIDAR PRODUCTOS
        // ======================================================

        const productosValidos =
          carrito.every(
            (item) => {
              const id =
                Number(
                  item.id_producto
                )

              const cantidad =
                Number(
                  item.cantidad
                )

              const precio =
                Number(
                  item.precio
                )

              return (
                Number.isInteger(
                  id
                ) &&
                id > 0 &&
                Number.isInteger(
                  cantidad
                ) &&
                cantidad > 0 &&
                Number.isFinite(
                  precio
                ) &&
                precio >= 0
              )
            }
          )

        if (!productosValidos) {
          throw new Error(
            'El carrito contiene un producto inválido.'
          )
        }

        // ======================================================
        // ITEMS PARA BACKEND
        // ======================================================

        const items =
          carrito.map(
            (item) => ({
              producto_id:
                Number(
                  item.id_producto
                ),

              nombre_producto:
                String(
                  item.nombre_producto ||
                    'Producto'
                ).trim(),

              precio_unitario:
                Number(
                  item.precio
                ) || 0,

              cantidad:
                Number(
                  item.cantidad
                ),
            })
          )

        // ======================================================
        // API
        // ======================================================

        if (!API_URL) {
          throw new Error(
            'API_URL no está configurado correctamente.'
          )
        }

        const url =
          `${API_URL.replace(
            /\/$/,
            ''
          )}/api/pedidos`

        console.log(
          '===================================='
        )

        console.log(
          'REALIZANDO COMPRA'
        )

        console.log(
          'URL:',
          url
        )

        console.log(
          'USUARIO:',
          idUsuario
        )

        console.log(
          'ITEMS:',
          items
        )

        console.log(
          '===================================='
        )

        setComprando(true)

        try {
          const respuesta =
            await fetch(
              url,
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',

                  Authorization:
                    `Bearer ${token}`,
                },

                body:
                  JSON.stringify({
                    items,
                  }),
              }
            )

          let datos = null

          try {
            datos =
              await respuesta.json()
          } catch {
            datos = null
          }

          console.log(
            'RESPUESTA COMPRA:',
            respuesta.status,
            datos
          )

          if (!respuesta.ok) {
            const mensaje =
              datos?.detail ||
              datos?.message ||
              `Error HTTP ${respuesta.status}`

            throw new Error(
              mensaje
            )
          }

          // ====================================================
          // VALIDAR QUE EL BACKEND DEVOLVIÓ PEDIDO
          // ====================================================

          if (
            !datos ||
            typeof datos !== 'object'
          ) {
            throw new Error(
              'La compra se registró, pero el servidor no devolvió la información del pedido.'
            )
          }

          // ====================================================
          // GENERAR LA FACTURA PDF
          // USANDO EL PEDIDO REAL DE LA BD
          // ====================================================

          generarFacturaPDF(
            datos,
            usuario
          )

          // ====================================================
          // LIMPIAR CARRITO SOLO DESPUÉS DE TODO
          // ====================================================

          setCarrito([])

          return datos
        } finally {
          setComprando(false)
        }
      },
      [
        carrito,
        comprando,
      ]
    )

  // ============================================================
  // VALUE
  // ============================================================

  const value =
    useMemo(
      () => ({
        carrito,

        cart: carrito,

        usuarioId,

        count,

        total,

        comprando,

        agregarAlCarrito,

        agregarProducto,

        aumentarCantidad,

        disminuirCantidad,

        actualizarCantidad,

        updateQuantity,

        eliminarDelCarrito,

        removeItem,

        vaciarCarrito,

        clearCart,

        clearCartOnLogout,

        obtenerSubtotal,

        checkout,
      }),
      [
        carrito,
        usuarioId,
        count,
        total,
        comprando,
        agregarAlCarrito,
        agregarProducto,
        aumentarCantidad,
        disminuirCantidad,
        actualizarCantidad,
        updateQuantity,
        eliminarDelCarrito,
        removeItem,
        vaciarCarrito,
        clearCart,
        clearCartOnLogout,
        obtenerSubtotal,
        checkout,
      ]
    )

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  )
}

// ============================================================
// HOOK
// ============================================================

export function useCart() {
  const context =
    useContext(CartContext)

  if (!context) {
    throw new Error(
      'useCart debe utilizarse dentro de CartProvider'
    )
  }

  return context
}

export default CartContext