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

const CART_KEY = 'cellworld_cart'

const leerCarritoInicial = () => {
  try {
    const carritoGuardado =
      localStorage.getItem(CART_KEY)

    if (!carritoGuardado) {
      return []
    }

    const carritoParseado =
      JSON.parse(carritoGuardado)

    return Array.isArray(carritoParseado)
      ? carritoParseado
      : []
  } catch (error) {
    console.error(
      'Error leyendo el carrito:',
      error
    )

    return []
  }
}

function formatearPrecioFactura(valor) {
  return new Intl.NumberFormat(
    'es-CO',
    {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }
  ).format(
    Number(valor) || 0
  )
}

function formatearFechaFactura(valor) {
  try {
    return new Date(
      valor
    ).toLocaleString(
      'es-CO',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  } catch {
    return new Date().toLocaleString(
      'es-CO',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  }
}

function obtenerNombreClienteFactura(
  usuario
) {
  if (!usuario) {
    return 'Cliente'
  }

  return (
    usuario.nombre_completo ||
    usuario.nombre ||
    usuario.name ||
    usuario.usuario ||
    usuario.username ||
    usuario.correo ||
    usuario.email ||
    'Cliente'
  )
}

function obtenerCorreoClienteFactura(
  usuario
) {
  if (!usuario) {
    return ''
  }

  return (
    usuario.correo ||
    usuario.email ||
    usuario.email_usuario ||
    ''
  )
}

function obtenerDetallesFactura(
  pedido
) {
  if (!pedido) {
    return []
  }

  if (
    Array.isArray(
      pedido.detalles
    )
  ) {
    return pedido.detalles
  }

  if (
    Array.isArray(
      pedido.detalle_pedidos
    )
  ) {
    return pedido.detalle_pedidos
  }

  if (
    Array.isArray(
      pedido.items
    )
  ) {
    return pedido.items
  }

  if (
    Array.isArray(
      pedido.productos
    )
  ) {
    return pedido.productos
  }

  return []
}

export function generarFacturaPDF(
  pedido,
  usuario = null
) {
  if (
    !pedido ||
    typeof pedido !== 'object'
  ) {
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

  const anchoContenido =
    anchoPagina -
    margen * 2

  const detalles =
    obtenerDetallesFactura(
      pedido
    )

  const nombreCliente =
    obtenerNombreClienteFactura(
      usuario
    )

  const correoCliente =
    obtenerCorreoClienteFactura(
      usuario
    )

  const subtotalCalculado =
    detalles.reduce(
      (
        acumulado,
        item
      ) => {
        const precio =
          Number(
            item.precio_unitario ??
              item.precio ??
              0
          ) || 0

        const cantidad =
          Number(
            item.cantidad
          ) || 0

        return (
          acumulado +
          precio * cantidad
        )
      },
      0
    )

  const descuento =
    Number(
      pedido.descuento
    ) || 0

  const iva =
    Number(
      pedido.iva
    ) || 0

  const subtotal =
    subtotalCalculado

  const total =
    Number(
      pedido.total
    ) ||
    Math.max(
      subtotal -
        descuento +
        iva,
      0
    )

  const idPedido =
    pedido.id_pedido ??
    pedido.id ??
    pedido.pedido_id ??
    'N/A'

  const estadoOriginal =
    String(
      pedido.estado ||
        'pagado'
    )

  const estado =
    estadoOriginal
      .charAt(0)
      .toUpperCase() +
    estadoOriginal.slice(1)

  const fecha =
    formatearFechaFactura(
      pedido.creado_en ||
        pedido.fecha ||
        pedido.created_at ||
        new Date()
    )

  /*
   * ============================================================
   * PIE DE PÁGINA
   * ============================================================
   */

  const dibujarPiePagina = () => {
    const y =
      altoPagina - 18

    doc.setDrawColor(
      225,
      228,
      232
    )

    doc.setLineWidth(
      0.3
    )

    doc.line(
      margen,
      y - 7,
      anchoPagina - margen,
      y - 7
    )

    doc.setFont(
      'helvetica',
      'normal'
    )

    doc.setFontSize(8)

    doc.setTextColor(
      110,
      110,
      110
    )

    doc.text(
      'Gracias por comprar en CellWorld.',
      anchoPagina / 2,
      y,
      {
        align: 'center',
      }
    )

    doc.text(
      'Comprobante generado digitalmente.',
      anchoPagina / 2,
      y + 5,
      {
        align: 'center',
      }
    )
  }

  /*
   * ============================================================
   * ENCABEZADO DE TABLA
   * ============================================================
   */

  const dibujarEncabezadoTabla =
    (y) => {
      const altoFila = 11

      doc.setFillColor(
        243,
        245,
        248
      )

      doc.roundedRect(
        margen,
        y,
        anchoContenido,
        altoFila,
        2,
        2,
        'F'
      )

      doc.setFont(
        'helvetica',
        'bold'
      )

      doc.setFontSize(
        8.5
      )

      doc.setTextColor(
        65,
        65,
        65
      )

      doc.text(
        'PRODUCTO',
        margen + 4,
        y + 7
      )

      doc.text(
        'CANT.',
        116,
        y + 7,
        {
          align: 'center',
        }
      )

      doc.text(
        'PRECIO',
        145,
        y + 7,
        {
          align: 'right',
        }
      )

      doc.text(
        'TOTAL',
        anchoPagina -
          margen -
          4,
        y + 7,
        {
          align: 'right',
        }
      )

      return (
        y + altoFila
      )
    }

  /*
   * ============================================================
   * ENCABEZADO PRINCIPAL
   * ============================================================
   */

  doc.setFillColor(
    25,
    118,
    210
  )

  doc.rect(
    0,
    0,
    anchoPagina,
    42,
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

  doc.setFontSize(
    22
  )

  doc.text(
    'CellWorld',
    margen,
    17
  )

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(
    9
  )

  doc.text(
    'Tecnología y soluciones móviles',
    margen,
    25
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(
    15
  )

  doc.text(
    'FACTURA',
    anchoPagina -
      margen,
    16,
    {
      align: 'right',
    }
  )

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(
    9
  )

  doc.text(
    `No. ${idPedido}`,
    anchoPagina -
      margen,
    24,
    {
      align: 'right',
    }
  )

  doc.text(
    fecha,
    anchoPagina -
      margen,
    31,
    {
      align: 'right',
    }
  )

  /*
   * ============================================================
   * INFORMACIÓN DE LA COMPRA
   * ============================================================
   */

  let y = 55

  doc.setTextColor(
    35,
    35,
    35
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(
    11
  )

  doc.text(
    'INFORMACIÓN DE LA COMPRA',
    margen,
    y
  )

  y += 8

  doc.setFillColor(
    248,
    249,
    251
  )

  doc.roundedRect(
    margen,
    y,
    anchoContenido,
    32,
    3,
    3,
    'F'
  )

  /*
   * CLIENTE
   */

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(
    8
  )

  doc.setTextColor(
    105,
    105,
    105
  )

  doc.text(
    'CLIENTE',
    margen + 6,
    y + 9
  )

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(
    10
  )

  doc.setTextColor(
    40,
    40,
    40
  )

  doc.text(
    nombreCliente ||
      'Cliente',
    margen + 6,
    y + 16
  )

  /*
   * CORREO
   */

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(
    8
  )

  doc.setTextColor(
    105,
    105,
    105
  )

  doc.text(
    'CORREO',
    margen + 6,
    y + 25
  )

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(
    9
  )

  doc.setTextColor(
    40,
    40,
    40
  )

  const correoMostrar =
    correoCliente ||
    'No registrado'

  doc.text(
    correoMostrar,
    margen + 31,
    y + 25
  )

  /*
   * ESTADO
   */

  const estadoX =
    anchoPagina -
    margen -
    42

  const estadoY =
    y + 9

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(
    8
  )

  doc.setTextColor(
    105,
    105,
    105
  )

  doc.text(
    'ESTADO',
    estadoX,
    y + 9
  )

  doc.setFillColor(
    220,
    252,
    231
  )

  doc.roundedRect(
    estadoX,
    estadoY + 5,
    36,
    10,
    5,
    5,
    'F'
  )

  doc.setTextColor(
    22,
    101,
    52
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(
    8
  )

  doc.text(
    estado,
    estadoX + 18,
    estadoY + 11.5,
    {
      align: 'center',
    }
  )

  y += 43

  /*
   * ============================================================
   * DETALLE DE PRODUCTOS
   * ============================================================
   */

  doc.setTextColor(
    35,
    35,
    35
  )

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(
    11
  )

  doc.text(
    'DETALLE DE PRODUCTOS',
    margen,
    y
  )

  y += 7

  y =
    dibujarEncabezadoTabla(
      y
    )

  /*
   * ============================================================
   * PRODUCTOS
   * ============================================================
   */

  detalles.forEach(
    (
      item,
      index
    ) => {
      const nombre =
        item.nombre_producto ||
        item.nombre ||
        'Producto'

      const cantidad =
        Number(
          item.cantidad
        ) || 0

      const precio =
        Number(
          item.precio_unitario ??
            item.precio ??
            0
        ) || 0

      const totalProducto =
        precio * cantidad

      const nombreDividido =
        doc.splitTextToSize(
          nombre,
          83
        )

      const altoFila =
        Math.max(
          14,
          nombreDividido.length *
            4.5 +
            8
        )

      /*
       * SALTO DE PÁGINA
       */

      if (
        y + altoFila >
        altoPagina - 38
      ) {
        dibujarPiePagina()

        doc.addPage()

        y = 20

        doc.setFont(
          'helvetica',
          'bold'
        )

        doc.setFontSize(
          11
        )

        doc.setTextColor(
          35,
          35,
          35
        )

        doc.text(
          'DETALLE DE PRODUCTOS',
          margen,
          y
        )

        y += 7

        y =
          dibujarEncabezadoTabla(
            y
          )
      }

      /*
       * FILAS ALTERNADAS
       */

      if (
        index % 2 === 1
      ) {
        doc.setFillColor(
          250,
          251,
          252
        )

        doc.rect(
          margen,
          y,
          anchoContenido,
          altoFila,
          'F'
        )
      }

      /*
       * NOMBRE
       */

      doc.setFont(
        'helvetica',
        'normal'
      )

      doc.setFontSize(
        8.5
      )

      doc.setTextColor(
        45,
        45,
        45
      )

      doc.text(
        nombreDividido,
        margen + 4,
        y + 6
      )

      /*
       * CANTIDAD
       */

      doc.text(
        String(cantidad),
        116,
        y + 7,
        {
          align: 'center',
        }
      )

      /*
       * PRECIO
       */

      doc.text(
        formatearPrecioFactura(
          precio
        ),
        145,
        y + 7,
        {
          align: 'right',
        }
      )

      /*
       * TOTAL PRODUCTO
       */

      doc.setFont(
        'helvetica',
        'bold'
      )

      doc.text(
        formatearPrecioFactura(
          totalProducto
        ),
        anchoPagina -
          margen -
          4,
        y + 7,
        {
          align: 'right',
        }
      )

      /*
       * SEPARADOR
       */

      doc.setDrawColor(
        225,
        228,
        232
      )

      doc.setLineWidth(
        0.25
      )

      doc.line(
        margen,
        y + altoFila,
        anchoPagina -
          margen,
        y + altoFila
      )

      y += altoFila
    }
  )

  /*
   * ============================================================
   * TOTALES
   * ============================================================
   */

  const alturaTotales =
    58

  if (
    y + alturaTotales >
    altoPagina - 30
  ) {
    dibujarPiePagina()

    doc.addPage()

    y = 25
  } else {
    y += 8
  }

  const cajaTotalesX =
    anchoPagina -
    margen -
    82

  const cajaTotalesAncho =
    82

  doc.setFillColor(
    248,
    249,
    251
  )

  doc.roundedRect(
    cajaTotalesX,
    y,
    cajaTotalesAncho,
    alturaTotales,
    3,
    3,
    'F'
  )

  doc.setFontSize(
    9
  )

  /*
   * SUBTOTAL
   */

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setTextColor(
    90,
    90,
    90
  )

  doc.text(
    'Subtotal',
    cajaTotalesX + 6,
    y + 11
  )

  doc.text(
    formatearPrecioFactura(
      subtotal
    ),
    anchoPagina -
      margen -
      6,
    y + 11,
    {
      align: 'right',
    }
  )

  /*
   * DESCUENTO
   */

  let siguienteLinea =
    22

  if (
    descuento > 0
  ) {
    doc.text(
      'Descuento',
      cajaTotalesX + 6,
      y + siguienteLinea
    )

    doc.text(
      `-${formatearPrecioFactura(
        descuento
      )}`,
      anchoPagina -
        margen -
        6,
      y + siguienteLinea,
      {
        align: 'right',
      }
    )

    siguienteLinea += 11
  }

  /*
   * IVA
   */

  if (
    iva > 0
  ) {
    doc.text(
      'IVA',
      cajaTotalesX + 6,
      y + siguienteLinea
    )

    doc.text(
      formatearPrecioFactura(
        iva
      ),
      anchoPagina -
        margen -
        6,
      y + siguienteLinea,
      {
        align: 'right',
      }
    )

    siguienteLinea += 11
  }

  /*
   * LÍNEA TOTAL
   */

  const lineaTotalY =
    y + siguienteLinea

  doc.setDrawColor(
    210,
    214,
    219
  )

  doc.setLineWidth(
    0.4
  )

  doc.line(
    cajaTotalesX + 6,
    lineaTotalY,
    anchoPagina -
      margen -
      6,
    lineaTotalY
  )

  /*
   * TOTAL
   */

  doc.setFont(
    'helvetica',
    'bold'
  )

  doc.setFontSize(
    11
  )

  doc.setTextColor(
    25,
    118,
    210
  )

  doc.text(
    'TOTAL',
    cajaTotalesX + 6,
    lineaTotalY + 11
  )

  doc.text(
    formatearPrecioFactura(
      total
    ),
    anchoPagina -
      margen -
      6,
    lineaTotalY + 11,
    {
      align: 'right',
    }
  )

  /*
   * ============================================================
   * MENSAJE FINAL
   * ============================================================
   */

  const mensajeY =
    Math.min(
      lineaTotalY + 25,
      altoPagina - 35
    )

  doc.setFont(
    'helvetica',
    'normal'
  )

  doc.setFontSize(
    8
  )

  doc.setTextColor(
    110,
    110,
    110
  )

  doc.text(
    'Este documento corresponde al comprobante de la compra realizada',
    anchoPagina / 2,
    mensajeY,
    {
      align: 'center',
    }
  )

  doc.text(
    'a través de la plataforma CellWorld.',
    anchoPagina / 2,
    mensajeY + 5,
    {
      align: 'center',
    }
  )

  /*
   * ============================================================
   * PIE DE PÁGINA
   * ============================================================
   */

  dibujarPiePagina()

  /*
   * ============================================================
   * GUARDAR PDF
   * ============================================================
   */

  doc.save(
    `Factura_CellWorld_${idPedido}.pdf`
  )
}

export function CartProvider({
  children,
}) {
  const [carrito, setCarrito] =
    useState(
      leerCarritoInicial
    )

  const [procesandoCompra, setProcesandoCompra] =
    useState(false)

  /*
   * ============================================================
   * SINCRONIZAR CARRITO
   * ============================================================
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(carrito)
      )
    } catch (error) {
      console.error(
        'Error guardando el carrito:',
        error
      )
    }
  }, [carrito])

  /*
   * ============================================================
   * ESCUCHAR CAMBIOS DEL CARRITO
   * ============================================================
   */

  useEffect(() => {
    const manejarCambioStorage =
      (evento) => {
        if (
          evento.key !==
          CART_KEY
        ) {
          return
        }

        try {
          const nuevoCarrito =
            evento.newValue
              ? JSON.parse(
                  evento.newValue
                )
              : []

          setCarrito(
            Array.isArray(
              nuevoCarrito
            )
              ? nuevoCarrito
              : []
          )
        } catch (error) {
          console.error(
            'Error sincronizando el carrito:',
            error
          )
        }
      }

    window.addEventListener(
      'storage',
      manejarCambioStorage
    )

    return () => {
      window.removeEventListener(
        'storage',
        manejarCambioStorage
      )
    }
  }, [])

  /*
   * ============================================================
   * AGREGAR AL CARRITO
   * ============================================================
   */

  const agregarAlCarrito =
    useCallback(
      (producto) => {
        if (!producto) {
          return
        }

        setCarrito(
          (carritoAnterior) => {
            const idProducto =
              producto.id_producto ??
              producto.id

            const indice =
              carritoAnterior.findIndex(
                (item) =>
                  (
                    item.id_producto ??
                    item.id
                  ) ===
                  idProducto
              )

            if (
              indice !== -1
            ) {
              return carritoAnterior.map(
                (
                  item,
                  index
                ) =>
                  index ===
                  indice
                    ? {
                        ...item,
                        cantidad:
                          (
                            Number(
                              item.cantidad
                            ) || 0
                          ) + 1,
                      }
                    : item
              )
            }

            return [
              ...carritoAnterior,
              {
                ...producto,
                cantidad: 1,
              },
            ]
          }
        )
      },
      []
    )

  /*
   * ============================================================
   * ELIMINAR DEL CARRITO
   * ============================================================
   */

  const eliminarDelCarrito =
    useCallback(
      (idProducto) => {
        setCarrito(
          (carritoAnterior) =>
            carritoAnterior.filter(
              (item) =>
                (
                  item.id_producto ??
                  item.id
                ) !==
                idProducto
            )
        )
      },
      []
    )

  /*
   * ============================================================
   * ACTUALIZAR CANTIDAD
   * ============================================================
   */

  const actualizarCantidad =
    useCallback(
      (
        idProducto,
        nuevaCantidad
      ) => {
        const cantidad =
          Number(
            nuevaCantidad
          )

        if (
          !Number.isFinite(
            cantidad
          ) ||
          cantidad <= 0
        ) {
          eliminarDelCarrito(
            idProducto
          )
          return
        }

        setCarrito(
          (carritoAnterior) =>
            carritoAnterior.map(
              (item) =>
                (
                  item.id_producto ??
                  item.id
                ) ===
                idProducto
                  ? {
                      ...item,
                      cantidad,
                    }
                  : item
            )
        )
      },
      [
        eliminarDelCarrito,
      ]
    )

  /*
   * ============================================================
   * VACIAR CARRITO
   * ============================================================
   */

  const vaciarCarrito =
    useCallback(() => {
      setCarrito([])
    }, [])

  /*
   * ============================================================
   * TOTAL DE PRODUCTOS
   * ============================================================
   */

  const cantidadTotal =
    useMemo(
      () =>
        carrito.reduce(
          (
            total,
            item
          ) =>
            total +
            (
              Number(
                item.cantidad
              ) || 0
            ),
          0
        ),
      [carrito]
    )

  /*
   * ============================================================
   * TOTAL DEL CARRITO
   * ============================================================
   */

  const totalCarrito =
    useMemo(
      () =>
        carrito.reduce(
          (
            total,
            item
          ) => {
            const precio =
              Number(
                item.precio ??
                item.precio_unitario ??
                0
              ) || 0

            const cantidad =
              Number(
                item.cantidad
              ) || 0

            return (
              total +
              precio *
                cantidad
            )
          },
          0
        ),
      [carrito]
    )

  /*
   * ============================================================
   * CHECKOUT
   * ============================================================
   */

  const realizarCompra =
    useCallback(
      async () => {
        if (
          carrito.length ===
          0
        ) {
          throw new Error(
            'El carrito está vacío.'
          )
        }

        const token =
          localStorage.getItem(
            'token'
          )

        const usuarioGuardado =
          localStorage.getItem(
            'usuario'
          )

        if (!token) {
          throw new Error(
            'Debes iniciar sesión para realizar la compra.'
          )
        }

        let usuario = null

        try {
          usuario =
            usuarioGuardado
              ? JSON.parse(
                  usuarioGuardado
                )
              : null
        } catch {
          usuario = null
        }

        const usuarioId =
          usuario?.id_usuario ??
          usuario?.id ??
          usuario?.usuario_id

        if (!usuarioId) {
          throw new Error(
            'No se pudo identificar al usuario.'
          )
        }

        setProcesandoCompra(
          true
        )

        try {
          const detalles =
            carrito.map(
              (item) => ({
                producto_id:
                  item.id_producto ??
                  item.id,

                nombre_producto:
                  item.nombre_producto ??
                  item.nombre ??
                  'Producto',

                precio_unitario:
                  Number(
                    item.precio ??
                    item.precio_unitario ??
                    0
                  ) || 0,

                cantidad:
                  Number(
                    item.cantidad
                  ) || 1,
              })
            )

          const total =
            detalles.reduce(
              (
                acumulado,
                item
              ) =>
                acumulado +
                item.precio_unitario *
                  item.cantidad,
              0
            )

          const respuesta =
            await fetch(
              `${API_URL}/api/pedidos`,
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(
                  {
                    usuario_id:
                      usuarioId,
                    total,
                    estado:
                      'pagado',
                    detalles,
                  }
                ),
              }
            )

          const datos =
            await respuesta
              .json()
              .catch(
                () => null
              )

          if (
            !respuesta.ok
          ) {
            throw new Error(
              datos?.detail ||
                datos?.mensaje ||
                'No se pudo registrar la compra.'
            )
          }

          generarFacturaPDF(
            datos,
            usuario
          )

          setCarrito([])

          localStorage.removeItem(
            CART_KEY
          )

          window.dispatchEvent(
            new CustomEvent(
              'compraRealizada',
              {
                detail: datos,
              }
            )
          )

          return datos
        } finally {
          setProcesandoCompra(
            false
          )
        }
      },
      [carrito]
    )

  /*
   * ============================================================
   * LIMPIAR CARRITO AL CERRAR SESIÓN
   * ============================================================
   */

  const clearCartOnLogout =
    useCallback(() => {
      setCarrito([])

      try {
        localStorage.removeItem(
          CART_KEY
        )
      } catch (error) {
        console.error(
          'Error limpiando carrito:',
          error
        )
      }
    }, [])

  /*
   * ============================================================
   * VALOR DEL CONTEXTO
   * ============================================================
   */

  const valor = useMemo(
    () => ({
      carrito,
      cantidadTotal,
      totalCarrito,
      procesandoCompra,

      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      vaciarCarrito,

      realizarCompra,
      clearCartOnLogout,

      generarFacturaPDF,
    }),
    [
      carrito,
      cantidadTotal,
      totalCarrito,
      procesandoCompra,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      vaciarCarrito,
      realizarCompra,
      clearCartOnLogout,
    ]
  )

  return (
    <CartContext.Provider
      value={valor}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const contexto =
    useContext(
      CartContext
    )

  if (!contexto) {
    throw new Error(
      'useCart debe utilizarse dentro de CartProvider.'
    )
  }

  return contexto
}

export default CartContext