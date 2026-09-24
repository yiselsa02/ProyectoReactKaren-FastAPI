import { useEffect, useState } from 'react'
import {
  Heart,
  ShoppingBag,
  User,
  LayoutDashboard,
  X,
  Package,
  CalendarDays,
  CreditCard,
  Eye,
  Trash2,
  ShoppingCart,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { API_URL } from '../config'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoDark from '../assets/logo-dark.png'

const COMPRAS_KEY = 'cellworld_compras'

function obtenerClaveFavoritos(usuario) {
  const idUsuario =
    usuario?.id_usuario ??
    usuario?.usuario_id ??
    usuario?.id ??
    usuario?.email ??
    usuario?.correo

  if (!idUsuario) {
    return 'cellworld_favorites_guest'
  }

  return `cellworld_favorites_${idUsuario}`
}
function obtenerIdProducto(producto) {
  return (
    producto?.id_producto ??
    producto?.id ??
    producto?.producto_id ??
    producto?.idProducto ??
    null
  )
}

function obtenerNombreProducto(producto) {
  return (
    producto?.nombre_producto ??
    producto?.nombre ??
    producto?.name ??
    producto?.producto?.nombre ??
    producto?.producto?.name ??
    'Producto'
  )
}

function obtenerPrecioProducto(producto) {
  return Number(
    producto?.precio_unitario ??
    producto?.precio ??
    producto?.price ??
    producto?.producto?.precio ??
    producto?.producto?.price ??
    0
  )
}

function obtenerImagenProducto(producto) {
  return (
    producto?.imagen ??
    producto?.image ??
    producto?.imagen_url ??
    producto?.producto?.imagen ??
    producto?.producto?.image ??
    null
  )
}

function normalizarProducto(producto) {
  const id = obtenerIdProducto(producto)

  return {
    ...producto,
    id: id ?? `producto-${Math.random()}`,
    name: obtenerNombreProducto(producto),
    price: obtenerPrecioProducto(producto),
    image: obtenerImagenProducto(producto),
  }
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0)
}

function formatearFecha(fecha) {
  if (!fecha) return 'Fecha no disponible'

  const fechaObjeto = new Date(fecha)

  if (Number.isNaN(fechaObjeto.getTime())) {
    return 'Fecha no disponible'
  }

  return fechaObjeto.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function obtenerProductosCompra(compra) {
  if (Array.isArray(compra?.detalles)) {
    return compra.detalles
  }

  if (Array.isArray(compra?.detalle_pedido)) {
    return compra.detalle_pedido
  }

  if (Array.isArray(compra?.detalles_pedido)) {
    return compra.detalles_pedido
  }

  if (Array.isArray(compra?.productos)) {
    return compra.productos
  }

  if (Array.isArray(compra?.items)) {
    return compra.items
  }

  if (compra?.producto) {
    return [compra.producto]
  }

  return []
}

function obtenerTotalCompra(compra) {
  if (compra?.total !== undefined && compra?.total !== null) {
    return Number(compra.total) || 0
  }

  const productos = obtenerProductosCompra(compra)

  return productos.reduce((total, producto) => {
    const precio = obtenerPrecioProducto(producto)
    const cantidad = Number(producto?.cantidad ?? producto?.quantity ?? 1)

    return total + precio * cantidad
  }, 0)
}

function obtenerFechaCompra(compra) {
  return (
    compra?.creado_en ??
    compra?.fecha ??
    compra?.fecha_pedido ??
    compra?.created_at ??
    compra?.createdAt ??
    null
  )
}

export default function PanelCliente({
  modoOscuro = false,
  usuario = null,
}) {
  const { addItem } = useCart()

  const [usuarioActual, setUsuarioActual] = useState(() => {
    if (usuario) return usuario

    try {
      const guardado = localStorage.getItem('usuario')
      return guardado ? JSON.parse(guardado) : null
    } catch {
      return null
    }
  })

  const favoritosKey = obtenerClaveFavoritos(usuarioActual)

  const [seccion, setSeccion] = useState('resumen')
  const [favoritos, setFavoritos] = useState([])
  const [favoritosCargados, setFavoritosCargados] = useState(false)
  const [compras, setCompras] = useState([])
  const [mostrarDetalles, setMostrarDetalles] = useState(false)
  const [compraSeleccionada, setCompraSeleccionada] = useState(null)
  const [cargandoCompras, setCargandoCompras] = useState(false)
  const [paginaCompras, setPaginaCompras] = useState(1)
  const [paginaFavoritos, setPaginaFavoritos] = useState(1)

  const elementosPorPaginaCompras = 5
  const elementosPorPaginaFavoritos = 6

  const [perfil, setPerfil] = useState(() => {
    let usuarioGuardado = null

    try {
      usuarioGuardado = JSON.parse(localStorage.getItem('usuario'))
    } catch {
      usuarioGuardado = null
    }

    const fuente = usuario || usuarioGuardado || {}

    return {
      nombres: fuente?.nombres || '',
      apellidos: fuente?.apellidos || '',
      email: fuente?.email || '',
      telefono: fuente?.telefono || '',
    }
  })

  useEffect(() => {
    const cargarUsuarioActual = () => {
      try {
        const guardado = localStorage.getItem('usuario')
        const usuarioGuardado = guardado ? JSON.parse(guardado) : null
        setUsuarioActual(usuario || usuarioGuardado || null)
      } catch {
        setUsuarioActual(usuario || null)
      }
    }

    cargarUsuarioActual()

    window.addEventListener('usuarioCambio', cargarUsuarioActual)
    window.addEventListener('storage', cargarUsuarioActual)
    window.addEventListener('focus', cargarUsuarioActual)

    return () => {
      window.removeEventListener('usuarioCambio', cargarUsuarioActual)
      window.removeEventListener('storage', cargarUsuarioActual)
      window.removeEventListener('focus', cargarUsuarioActual)
    }
  }, [usuario])

  useEffect(() => {
    if (usuario) {
      setPerfil({
        nombres: usuario?.nombres || '',
        apellidos: usuario?.apellidos || '',
        email: usuario?.email || '',
        telefono: usuario?.telefono || '',
      })
    }
  }, [usuario])

  useEffect(() => {
    setFavoritosCargados(false)

    try {
      const guardados = localStorage.getItem(favoritosKey)

      if (!guardados) {
        setFavoritos([])
        setFavoritosCargados(true)
        return
      }

      const datos = JSON.parse(guardados)
      setFavoritos(Array.isArray(datos) ? datos : [])
    } catch (error) {
      console.error('Error cargando favoritos:', error)
      setFavoritos([])
    } finally {
      setFavoritosCargados(true)
    }
  }, [favoritosKey])

  useEffect(() => {
    if (!favoritosCargados) return

    try {
      localStorage.setItem(
        favoritosKey,
        JSON.stringify(favoritos)
      )
    } catch (error) {
      console.error('Error guardando favoritos:', error)
    }
  }, [favoritos, favoritosCargados, favoritosKey])

  useEffect(() => {
    const actualizarFavoritos = (evento) => {
      if (
        evento?.detail?.key &&
        evento.detail.key !== favoritosKey
      ) {
        return
      }

      try {
        const guardados = localStorage.getItem(favoritosKey)

        if (!guardados) {
          setFavoritos([])
          return
        }

        const datos = JSON.parse(guardados)
        setFavoritos(Array.isArray(datos) ? datos : [])
      } catch (error) {
        console.error('Error actualizando favoritos:', error)
        setFavoritos([])
      }
    }

    window.addEventListener(
      'cellworld-favorites-updated',
      actualizarFavoritos
    )

    window.addEventListener('storage', actualizarFavoritos)
    window.addEventListener('focus', actualizarFavoritos)

    return () => {
      window.removeEventListener(
        'cellworld-favorites-updated',
        actualizarFavoritos
      )

      window.removeEventListener('storage', actualizarFavoritos)
      window.removeEventListener('focus', actualizarFavoritos)
    }
  }, [favoritosKey])

  useEffect(() => {
    cargarCompras()
  }, [])

  useEffect(() => {
    if (seccion === 'compras') {
      cargarCompras()
    }
  }, [seccion])

  useEffect(() => {
    const manejarEscape = (evento) => {
      if (evento.key === 'Escape') {
        setMostrarDetalles(false)
      }
    }

    if (mostrarDetalles) {
      document.addEventListener(
        'keydown',
        manejarEscape
      )
    }

    return () => {
      document.removeEventListener(
        'keydown',
        manejarEscape
      )
    }
  }, [mostrarDetalles])

  async function cargarCompras() {
    setCargandoCompras(true)

    const token = localStorage.getItem('token')

    try {
      if (!token) {
        const comprasLocales = JSON.parse(
          localStorage.getItem(COMPRAS_KEY)
        )

        setCompras(
          Array.isArray(comprasLocales)
            ? comprasLocales
            : []
        )

        return
      }

      const respuesta = await fetch(
        `${API_URL}/api/pedidos/mis-pedidos`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          data?.detail ||
            'No se pudieron cargar las compras.'
        )
      }

      let pedidos = []

      if (Array.isArray(data)) {
        pedidos = data
      } else if (Array.isArray(data?.pedidos)) {
        pedidos = data.pedidos
      } else if (Array.isArray(data?.data)) {
        pedidos = data.data
      } else if (Array.isArray(data?.items)) {
        pedidos = data.items
      }

      setCompras(pedidos)

      localStorage.setItem(
        COMPRAS_KEY,
        JSON.stringify(pedidos)
      )
    } catch (error) {
      console.error(
        'Error cargando compras:',
        error
      )

      try {
        const comprasLocales = JSON.parse(
          localStorage.getItem(COMPRAS_KEY)
        )

        setCompras(
          Array.isArray(comprasLocales)
            ? comprasLocales
            : []
        )
      } catch {
        setCompras([])
      }
    } finally {
      setCargandoCompras(false)
    }
  }

  function quitarFavorito(id) {
    setFavoritos((actuales) => {
      const nuevosFavoritos = actuales.filter(
        (producto) =>
          String(obtenerIdProducto(producto)) !== String(id)
      )

      try {
        localStorage.setItem(
          favoritosKey,
          JSON.stringify(nuevosFavoritos)
        )
      } catch (error) {
        console.error('Error guardando favoritos:', error)
      }

      window.dispatchEvent(
        new CustomEvent('cellworld-favorites-updated', {
          detail: { key: favoritosKey },
        })
      )

      return nuevosFavoritos
    })
  }

  function agregarFavoritoAlCarrito(producto) {
    const productoNormalizado =
      normalizarProducto(producto)

    addItem(productoNormalizado)
  }

  function abrirDetalles(compra) {
    setCompraSeleccionada(compra)
    setMostrarDetalles(true)
  }

  function cerrarDetalles() {
    setMostrarDetalles(false)
    setCompraSeleccionada(null)
  }

  const convertirImagenDataURL = (src) => {
    return new Promise((resolve, reject) => {
      const imagen = new Image()

      imagen.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = imagen.naturalWidth
        canvas.height = imagen.naturalHeight

        const contexto = canvas.getContext('2d')
        contexto.drawImage(imagen, 0, 0)

        resolve(canvas.toDataURL('image/png'))
      }

      imagen.onerror = reject
      imagen.src = src
    })
  }

  async function descargarFactura(compra) {
    if (!compra) {
      alert('No se encontró la información de la compra.')
      return
    }

    try {
      const documento = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const anchoPagina = documento.internal.pageSize.getWidth()
      const altoPagina = documento.internal.pageSize.getHeight()

      const numeroFactura =
        compra?.numero_factura ||
        compra?.factura ||
        compra?.id_pedido ||
        compra?.id ||
        'N/A'

      const fechaVenta =
        compra?.fecha ||
        compra?.creado_en ||
        compra?.fecha_pedido ||
        new Date()

      const estadoFactura = compra?.estado || 'Pagado'
      const productosCompra = obtenerProductosCompra(compra)
      const productos = Array.isArray(productosCompra)
        ? productosCompra
        : []

      const usuarioFactura = usuarioActual || usuario || {}

      const nombreCliente =
        `${usuarioFactura?.nombres || perfil?.nombres || ''} ${
          usuarioFactura?.apellidos || perfil?.apellidos || ''
        }`.trim() || 'Cliente'

      const documentoCliente =
        usuarioFactura?.numero_documento ||
        usuarioFactura?.documento ||
        usuarioFactura?.cedula ||
        compra?.documento_cliente ||
        compra?.numero_documento_cliente ||
        ''

      const correoCliente =
        usuarioFactura?.email ||
        perfil?.email ||
        compra?.correo_cliente ||
        compra?.email_cliente ||
        ''

      const telefonoCliente =
        usuarioFactura?.telefono ||
        perfil?.telefono ||
        compra?.telefono_cliente ||
        compra?.telefono ||
        ''

      const direccionCliente =
        usuarioFactura?.direccion ||
        compra?.direccion_cliente ||
        compra?.direccion ||
        ''

      const filasProductos = productos.map((producto, indice) => {
        const cantidad = Number(
          producto?.cantidad ?? producto?.quantity ?? 1
        ) || 0

        const precioUnitario = obtenerPrecioProducto(producto)
        const subtotal = cantidad * precioUnitario

        return [
          indice + 1,
          obtenerNombreProducto(producto),
          cantidad,
          formatearPrecio(precioUnitario),
          formatearPrecio(subtotal),
        ]
      })

      if (filasProductos.length === 0) {
        filasProductos.push([
          1,
          'Sin productos registrados',
          0,
          formatearPrecio(0),
          formatearPrecio(0),
        ])
      }

      const subtotalCalculado = productos.reduce((acumulado, producto) => {
        const cantidad = Number(
          producto?.cantidad ?? producto?.quantity ?? 1
        ) || 0
        const precio = obtenerPrecioProducto(producto)

        return acumulado + cantidad * precio
      }, 0)

      const subtotalRegistrado = Number(
        compra?.subtotal ?? compra?.sub_total
      )

      const subtotal =
        Number.isFinite(subtotalRegistrado) && subtotalRegistrado > 0
          ? subtotalRegistrado
          : subtotalCalculado

      const impuesto =
        Number(
          compra?.impuesto ??
          compra?.iva ??
          compra?.valor_iva ??
          0
        ) || 0

      const descuento = Number(compra?.descuento ?? 0) || 0
      const totalRegistrado = Number(compra?.total)

      const total = Number.isFinite(totalRegistrado)
        ? totalRegistrado
        : subtotal + impuesto - descuento

      documento.setFillColor(8, 17, 31)
      documento.rect(0, 0, anchoPagina, 42, 'F')

      try {
        const logoData = await convertirImagenDataURL(logoDark)
        documento.addImage(logoData, 'PNG', 14, 8, 36, 22)
      } catch {
        documento.setFillColor(37, 99, 235)
        documento.roundedRect(14, 9, 36, 20, 3, 3, 'F')

        documento.setTextColor(255, 255, 255)
        documento.setFont('helvetica', 'bold')
        documento.setFontSize(11)
        documento.text('CELLWORLD', 18, 21)
      }

      documento.setTextColor(255, 255, 255)
      documento.setFont('helvetica', 'bold')
      documento.setFontSize(19)
      documento.text('FACTURA DE VENTA', 58, 17)

      documento.setFont('helvetica', 'normal')
      documento.setFontSize(9)
      documento.text(
        'Sistema de gestión de ventas - CellWorld',
        58,
        24
      )

      documento.setFont('helvetica', 'bold')
      documento.setFontSize(10)
      documento.text(`N.º ${numeroFactura}`, anchoPagina - 14, 17, {
        align: 'right',
      })

      documento.setFont('helvetica', 'normal')
      documento.setFontSize(9)
      documento.text(
        `Fecha: ${formatearFecha(fechaVenta)}`,
        anchoPagina - 14,
        25,
        { align: 'right' }
      )

      documento.setFillColor(245, 247, 250)
      documento.roundedRect(
        14,
        50,
        anchoPagina - 28,
        39,
        3,
        3,
        'F'
      )

      documento.setTextColor(40, 50, 65)
      documento.setFont('helvetica', 'bold')
      documento.setFontSize(11)
      documento.text('DATOS DEL CLIENTE', 20, 59)

      documento.setFont('helvetica', 'normal')
      documento.setFontSize(9)
      documento.text(`Nombre: ${nombreCliente}`, 20, 67)

      if (documentoCliente) {
        documento.text(`Documento: ${documentoCliente}`, 20, 74)
      }

      if (correoCliente) {
        documento.text(`Correo: ${correoCliente}`, 20, 81)
      }

      if (telefonoCliente) {
        documento.text(`Teléfono: ${telefonoCliente}`, 105, 67)
      }

      if (direccionCliente) {
        documento.text(`Dirección: ${direccionCliente}`, 105, 74)
      }

      documento.setTextColor(100, 110, 125)
      documento.setFontSize(8)
      documento.text(`Estado: ${estadoFactura}`, 105, 81)

      autoTable(documento, {
        startY: 98,
        head: [[
          '#',
          'Producto / Servicio',
          'Cantidad',
          'Precio unitario',
          'Subtotal',
        ]],
        body: filasProductos,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 3,
          textColor: [35, 45, 60],
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 76 },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 35, halign: 'right' },
          4: { cellWidth: 35, halign: 'right' },
        },
        margin: {
          left: 14,
          right: 14,
        },
      })

      const posicionFinal = documento.lastAutoTable?.finalY || 110
      const resumenInicio = posicionFinal + 10

      documento.setFillColor(248, 250, 252)
      documento.roundedRect(
        anchoPagina - 91,
        resumenInicio,
        77,
        54,
        3,
        3,
        'F'
      )

      documento.setTextColor(70, 80, 95)
      documento.setFont('helvetica', 'normal')
      documento.setFontSize(9)
      documento.text('Subtotal', anchoPagina - 85, resumenInicio + 10)
      documento.text(formatearPrecio(subtotal), anchoPagina - 20, resumenInicio + 10, {
        align: 'right',
      })

      documento.text('Descuento', anchoPagina - 85, resumenInicio + 20)
      documento.text(formatearPrecio(descuento), anchoPagina - 20, resumenInicio + 20, {
        align: 'right',
      })

      documento.text('Impuestos', anchoPagina - 85, resumenInicio + 30)
      documento.text(formatearPrecio(impuesto), anchoPagina - 20, resumenInicio + 30, {
        align: 'right',
      })

      documento.setDrawColor(210, 215, 220)
      documento.line(
        anchoPagina - 85,
        resumenInicio + 35,
        anchoPagina - 20,
        resumenInicio + 35
      )

      documento.setTextColor(20, 30, 45)
      documento.setFont('helvetica', 'bold')
      documento.setFontSize(11)
      documento.text('TOTAL', anchoPagina - 85, resumenInicio + 46)
      documento.text(formatearPrecio(total), anchoPagina - 20, resumenInicio + 46, {
        align: 'right',
      })

      documento.setFillColor(8, 17, 31)
      documento.roundedRect(14, resumenInicio, 105, 54, 3, 3, 'F')

      documento.setTextColor(255, 255, 255)
      documento.setFont('helvetica', 'bold')
      documento.setFontSize(10)
      documento.text('INFORMACIÓN DE LA FACTURA', 20, resumenInicio + 11)

      documento.setFont('helvetica', 'normal')
      documento.setFontSize(8)
      documento.text(
        `Número de factura: ${numeroFactura}`,
        20,
        resumenInicio + 21
      )
      documento.text(
        `Estado: ${estadoFactura}`,
        20,
        resumenInicio + 29
      )
      documento.text(
        `Fecha de emisión: ${formatearFecha(fechaVenta)}`,
        20,
        resumenInicio + 37
      )
      documento.text(
        'Factura generada desde CellWorld.',
        20,
        resumenInicio + 46
      )

      documento.setTextColor(100, 110, 125)
      documento.setFont('helvetica', 'normal')
      documento.setFontSize(7)
      documento.text(
        'CellWorld - Documento generado desde el sistema de gestión de ventas',
        14,
        altoPagina - 9
      )
      documento.text('Página 1', anchoPagina - 14, altoPagina - 9, {
        align: 'right',
      })

      const numeroArchivo =
        String(numeroFactura).replace(/[^a-zA-Z0-9_-]/g, '') || 'venta'

      documento.save(`CellWorld_Factura_${numeroArchivo}.pdf`)
    } catch (error) {
      console.error('Error al generar factura:', error)
      alert('No se pudo generar la factura.')
    }
  }

  const nombreUsuario =
    usuario?.nombres ||
    perfil.nombres ||
    'Cliente'

  const totalFavoritos = favoritos.length
  const totalCompras = compras.length

  const totalPaginasCompras = Math.max(1, Math.ceil(totalCompras / elementosPorPaginaCompras))
  const totalPaginasFavoritos = Math.max(1, Math.ceil(totalFavoritos / elementosPorPaginaFavoritos))

  const comprasPaginaActual = compras.slice(
    (paginaCompras - 1) * elementosPorPaginaCompras,
    paginaCompras * elementosPorPaginaCompras
  )

  const favoritosPaginaActual = favoritos.slice(
    (paginaFavoritos - 1) * elementosPorPaginaFavoritos,
    paginaFavoritos * elementosPorPaginaFavoritos
  )

  useEffect(() => {
    if (paginaCompras > totalPaginasCompras) {
      setPaginaCompras(totalPaginasCompras)
    }
  }, [paginaCompras, totalPaginasCompras])

  useEffect(() => {
    if (paginaFavoritos > totalPaginasFavoritos) {
      setPaginaFavoritos(totalPaginasFavoritos)
    }
  }, [paginaFavoritos, totalPaginasFavoritos])

  const fondoPrincipal = modoOscuro
    ? 'bg-slate-950 text-white'
    : 'bg-gray-100 text-gray-900'

  const fondoTarjeta = modoOscuro
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-gray-200'

  const textoSecundario = modoOscuro
    ? 'text-gray-400'
    : 'text-gray-500'

  return (
    <div
      className={`min-h-screen w-full ${fondoPrincipal}`}
    >
      <div className="flex h-screen w-full overflow-hidden">
        {/* MENÚ LATERAL FIJO */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[245px] shrink-0 flex-col border-r ${
            modoOscuro
              ? 'border-slate-800 bg-slate-900'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div
            className={`flex h-[78px] shrink-0 items-center border-b px-5 ${
              modoOscuro ? 'border-slate-800' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <ShoppingCart size={21} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold">CellWorld</h1>
                <p className={`text-xs ${textoSecundario}`}>Panel de cliente</p>
              </div>
            </div>
          </div>

          <div className="px-4 pt-5">
            <div
              className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                modoOscuro ? 'bg-slate-950' : 'bg-gray-50'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  modoOscuro
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                <User size={19} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{nombreUsuario}</p>
                <p className={`text-xs ${textoSecundario}`}>Cliente</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
            <button type="button" onClick={() => setSeccion('resumen')}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${seccion === 'resumen' ? 'bg-blue-600 text-white' : textoSecundario}`}>
              <LayoutDashboard size={19} />
              <span>Resumen</span>
            </button>

            <button type="button" onClick={() => setSeccion('compras')}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${seccion === 'compras' ? 'bg-blue-600 text-white' : textoSecundario}`}>
              <ShoppingBag size={19} />
              <span>Mis compras</span>
              {totalCompras > 0 && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${seccion === 'compras' ? 'bg-white/20 text-white' : modoOscuro ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{totalCompras}</span>
              )}
            </button>

            <button type="button" onClick={() => setSeccion('seleccionados')}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${seccion === 'seleccionados' ? 'bg-blue-600 text-white' : textoSecundario}`}>
              <Heart size={19} />
              <span>Mis seleccionados</span>
              {totalFavoritos > 0 && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${seccion === 'seleccionados' ? 'bg-white/20 text-white' : modoOscuro ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{totalFavoritos}</span>
              )}
            </button>

            <button type="button" onClick={() => setSeccion('perfil')}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${seccion === 'perfil' ? 'bg-blue-600 text-white' : textoSecundario}`}>
              <User size={19} />
              <span>Mi perfil</span>
            </button>
          </nav>

          <div
            className={`shrink-0 border-t p-4 ${
              modoOscuro ? 'border-slate-800' : 'border-gray-200'
            }`}
          >
            <button
              type="button"
              onClick={() => { window.location.href = '/' }}
              className={`flex w-full items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                modoOscuro
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Volver a la tienda
            </button>
          </div>
        </aside>

        {/* ÁREA DE CONTENIDO */}
        <main className="min-w-0 flex-1 overflow-hidden lg:ml-[245px]">
          <div className="h-full overflow-hidden">
            <header
              className={`flex min-h-[78px] shrink-0 items-center border-b px-5 sm:px-7 ${
                modoOscuro ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'
              }`}
            >
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide ${textoSecundario}`}>
                  Panel de cliente
                </p>
                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  {seccion === 'resumen' && 'Resumen'}
                  {seccion === 'compras' && 'Mis compras'}
                  {seccion === 'seleccionados' && 'Mis seleccionados'}
                  {seccion === 'perfil' && 'Mi perfil'}
                </h1>
              </div>
            </header>

            <div className="h-[calc(100%-78px)] overflow-hidden p-5 sm:p-7">
            {/* RESUMEN */}
            {seccion === 'resumen' && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Resumen
                  </h2>

                  <p
                    className={`mt-1 ${textoSecundario}`}
                  >
                    Aquí puedes consultar rápidamente
                    tu actividad en CellWorld.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  <div
                    className={`rounded-3xl border p-6 shadow-sm ${fondoTarjeta}`}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          modoOscuro
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        <ShoppingBag size={23} />
                      </div>
                    </div>

                    <p
                      className={`text-sm ${textoSecundario}`}
                    >
                      Compras realizadas
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {totalCompras}
                    </p>
                  </div>

                  <div
                    className={`rounded-3xl border p-6 shadow-sm ${fondoTarjeta}`}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          modoOscuro
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        <Heart size={23} />
                      </div>
                    </div>

                    <p
                      className={`text-sm ${textoSecundario}`}
                    >
                      Productos seleccionados
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {totalFavoritos}
                    </p>
                  </div>

                  <div
                    className={`rounded-3xl border p-6 shadow-sm sm:col-span-2 xl:col-span-1 ${fondoTarjeta}`}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          modoOscuro
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-green-50 text-green-600'
                        }`}
                      >
                        <User size={23} />
                      </div>
                    </div>

                    <p
                      className={`text-sm ${textoSecundario}`}
                    >
                      Cuenta
                    </p>

                    <p className="mt-1 truncate text-lg font-bold">
                      {perfil.email || 'Cliente'}
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-6 rounded-3xl border p-6 shadow-sm ${fondoTarjeta}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        ¿Buscas algo nuevo?
                      </h3>

                      <p
                        className={`mt-1 text-sm ${textoSecundario}`}
                      >
                        Explora nuestro catálogo y
                        encuentra tu próximo celular.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href =
                          '/productos'
                      }}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      <ShoppingCart size={18} />
                      Ver productos
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* COMPRAS */}
            {seccion === 'compras' && (
              <section className="flex h-full min-h-0 flex-col">
                <div className="mb-5 shrink-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Mis compras</h2>
                      <p className={`mt-1 ${textoSecundario}`}>
                        Consulta el historial de tus pedidos realizados.
                      </p>
                    </div>
                    {totalCompras > 0 && (
                      <span className={`text-sm ${textoSecundario}`}>
                        {totalCompras} {totalCompras === 1 ? 'compra' : 'compras'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                  {cargandoCompras ? (
                    <div className={`rounded-3xl border p-10 text-center ${fondoTarjeta}`}>
                      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                      <p className={textoSecundario}>Cargando tus compras...</p>
                    </div>
                  ) : compras.length === 0 ? (
                    <div className={`rounded-3xl border p-10 text-center shadow-sm ${fondoTarjeta}`}>
                      <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${modoOscuro ? 'bg-slate-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        <Package size={30} />
                      </div>
                      <h3 className="text-xl font-bold">Aún no tienes compras</h3>
                      <p className={`mx-auto mt-2 max-w-md ${textoSecundario}`}>
                        Cuando realices una compra, aparecerá aquí junto con todos sus detalles.
                      </p>
                      <button type="button" onClick={() => { window.location.href = '/productos' }} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                        <ShoppingCart size={18} />
                        Ir al catálogo
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-full min-h-0 flex-col">
                      <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
                        {comprasPaginaActual.map((compra, indicePagina) => {
                          const productos = obtenerProductosCompra(compra)
                          const total = obtenerTotalCompra(compra)
                          const fecha = obtenerFechaCompra(compra)
                          const idPedido = compra?.id_pedido ?? compra?.id ?? ((paginaCompras - 1) * elementosPorPaginaCompras + indicePagina + 1)

                          return (
                            <article key={compra?.id_pedido ?? compra?.id ?? indicePagina} className={`rounded-2xl border shadow-sm transition hover:shadow-md ${fondoTarjeta}`}>
                              <div className="flex h-[104px] flex-col justify-center gap-3 px-4 py-3 sm:h-[112px] sm:px-5">
                                <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${modoOscuro ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                                        Pedido #{idPedido}
                                      </span>
                                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${modoOscuro ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'}`}>
                                        {compra?.estado || 'Pagado'}
                                      </span>
                                    </div>
                                    <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${textoSecundario}`}>
                                      <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />{formatearFecha(fecha)}</span>
                                      <span className="inline-flex items-center gap-1.5"><Package size={15} />{productos.length} {productos.length === 1 ? 'producto' : 'productos'}</span>
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                                    <div className="mr-1 min-w-[125px] text-right">
                                      <p className={`text-xs ${textoSecundario}`}>Total</p>
                                      <p className="text-lg font-bold">{formatearPrecio(total)}</p>
                                    </div>
                                    <button type="button" onClick={() => abrirDetalles(compra)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                                      <Eye size={17} />
                                      Ver detalles
                                    </button>
                                    <button type="button" onClick={() => descargarFactura(compra)} title="Descargar factura" className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${modoOscuro ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                      <Download size={17} />
                                      <span className="hidden sm:inline">Factura</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </article>
                          )
                        })}
                      </div>

                      {totalPaginasCompras > 1 && (
                        <div className={`mt-3 flex shrink-0 items-center justify-between rounded-2xl border px-3 py-2 ${fondoTarjeta}`}>
                          <button type="button" disabled={paginaCompras === 1} onClick={() => setPaginaCompras((pagina) => Math.max(1, pagina - 1))} className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${modoOscuro ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
                            <ChevronLeft size={17} /> Anterior
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPaginasCompras }, (_, indice) => indice + 1).map((pagina) => (
                              <button key={pagina} type="button" onClick={() => setPaginaCompras(pagina)} className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold transition ${paginaCompras === pagina ? 'bg-blue-600 text-white' : modoOscuro ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {pagina}
                              </button>
                            ))}
                          </div>
                          <button type="button" disabled={paginaCompras === totalPaginasCompras} onClick={() => setPaginaCompras((pagina) => Math.min(totalPaginasCompras, pagina + 1))} className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${modoOscuro ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
                            Siguiente <ChevronRight size={17} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* SELECCIONADOS */}
            {seccion === 'seleccionados' && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Mis seleccionados
                  </h2>

                  <p
                    className={`mt-1 ${textoSecundario}`}
                  >
                    Aquí encontrarás los productos que
                    marcaste como favoritos.
                  </p>
                </div>

                {favoritos.length === 0 ? (
                  <div
                    className={`rounded-3xl border p-10 text-center shadow-sm ${fondoTarjeta}`}
                  >
                    <div
                      className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                        modoOscuro
                          ? 'bg-slate-800 text-gray-400'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Heart size={30} />
                    </div>

                    <h3 className="text-xl font-bold">
                      No tienes productos seleccionados
                    </h3>

                    <p
                      className={`mx-auto mt-2 max-w-md ${textoSecundario}`}
                    >
                      Presiona el corazón en cualquier
                      producto para guardarlo aquí.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href =
                          '/productos'
                      }}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Ver productos
                    </button>
                  </div>
                ) : (
                  <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {favoritosPaginaActual.map(
                      (producto, indice) => {
                        const id =
                          obtenerIdProducto(
                            producto
                          ) ?? indice

                        const nombre =
                          obtenerNombreProducto(
                            producto
                          )

                        const precio =
                          obtenerPrecioProducto(
                            producto
                          )

                        const imagen =
                          obtenerImagenProducto(
                            producto
                          )

                        return (
                          <article
                            key={String(id)}
                            className={`group overflow-hidden rounded-3xl border shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${fondoTarjeta}`}
                          >
                            <div
                              className={`relative flex h-56 items-center justify-center ${
                                modoOscuro
                                  ? 'bg-slate-950'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {imagen ? (
                                <img
                                  src={imagen}
                                  alt={nombre}
                                  className="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <Package
                                  size={45}
                                  className={
                                    textoSecundario
                                  }
                                />
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  quitarFavorito(id)
                                }
                                title="Quitar de seleccionados"
                                className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition hover:scale-105 ${
                                  modoOscuro
                                    ? 'bg-slate-900 text-red-400 hover:bg-red-500/10'
                                    : 'bg-white text-red-500 hover:bg-red-50'
                                }`}
                              >
                                <Trash2
                                  size={18}
                                />
                              </button>
                            </div>

                            <div className="p-5">
                              <h3 className="truncate text-lg font-bold">
                                {nombre}
                              </h3>

                              <p
                                className={`mt-2 text-xl font-bold ${modoOscuro ? 'text-blue-400' : 'text-blue-600'}`}
                              >
                                {formatearPrecio(
                                  precio
                                )}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  agregarFavoritoAlCarrito(
                                    producto
                                  )
                                }
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                              >
                                <ShoppingCart
                                  size={18}
                                />
                                Agregar al carrito
                              </button>
                            </div>
                          </article>
                        )
                      }
                    )}
                  </div>

                  {totalPaginasFavoritos > 1 && (
                    <div className={`mt-4 flex items-center justify-between rounded-2xl border px-3 py-2 ${fondoTarjeta}`}>
                      <button type="button" disabled={paginaFavoritos === 1} onClick={() => setPaginaFavoritos((pagina) => Math.max(1, pagina - 1))} className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${modoOscuro ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
                        <ChevronLeft size={17} /> Anterior
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPaginasFavoritos }, (_, indice) => indice + 1).map((pagina) => (
                          <button key={pagina} type="button" onClick={() => setPaginaFavoritos(pagina)} className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold transition ${paginaFavoritos === pagina ? 'bg-blue-600 text-white' : modoOscuro ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {pagina}
                          </button>
                        ))}
                      </div>
                      <button type="button" disabled={paginaFavoritos === totalPaginasFavoritos} onClick={() => setPaginaFavoritos((pagina) => Math.min(totalPaginasFavoritos, pagina + 1))} className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${modoOscuro ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
                        Siguiente <ChevronRight size={17} />
                      </button>
                    </div>
                  )}
                  </>
                )}
              </section>
            )}

            {/* PERFIL */}
            {seccion === 'perfil' && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Mi perfil
                  </h2>

                  <p
                    className={`mt-1 ${textoSecundario}`}
                  >
                    Información de tu cuenta en CellWorld.
                  </p>
                </div>

                <div
                  className={`rounded-3xl border p-5 shadow-sm sm:p-7 ${fondoTarjeta}`}
                >
                  <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                        modoOscuro
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <User size={30} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-bold">
                        {perfil.nombres}{' '}
                        {perfil.apellidos}
                      </h3>

                      <p
                        className={`mt-1 truncate ${textoSecundario}`}
                      >
                        {perfil.email ||
                          'Correo no disponible'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label
                        className={`mb-2 block text-sm font-semibold ${textoSecundario}`}
                      >
                        Nombres
                      </label>

                      <input
                        type="text"
                        value={perfil.nombres}
                        readOnly
                        className={`w-full rounded-2xl border px-4 py-3 outline-none ${
                          modoOscuro
                            ? 'border-slate-700 bg-slate-950 text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`mb-2 block text-sm font-semibold ${textoSecundario}`}
                      >
                        Apellidos
                      </label>

                      <input
                        type="text"
                        value={perfil.apellidos}
                        readOnly
                        className={`w-full rounded-2xl border px-4 py-3 outline-none ${
                          modoOscuro
                            ? 'border-slate-700 bg-slate-950 text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`mb-2 block text-sm font-semibold ${textoSecundario}`}
                      >
                        Correo electrónico
                      </label>

                      <input
                        type="email"
                        value={perfil.email}
                        readOnly
                        className={`w-full rounded-2xl border px-4 py-3 outline-none ${
                          modoOscuro
                            ? 'border-slate-700 bg-slate-950 text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`mb-2 block text-sm font-semibold ${textoSecundario}`}
                      >
                        Teléfono
                      </label>

                      <input
                        type="text"
                        value={perfil.telefono}
                        readOnly
                        className={`w-full rounded-2xl border px-4 py-3 outline-none ${
                          modoOscuro
                            ? 'border-slate-700 bg-slate-950 text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL DETALLES DE COMPRA */}
      {mostrarDetalles &&
        compraSeleccionada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
            onMouseDown={(evento) => {
              if (
                evento.target === evento.currentTarget
              ) {
                cerrarDetalles()
              }
            }}
          >
            <div
              className={`flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border shadow-2xl ${
                modoOscuro
                  ? 'border-slate-800 bg-slate-900 text-white'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            >
              {/* HEADER MODAL */}
              <div
                className={`flex shrink-0 items-start justify-between gap-4 border-b p-5 sm:p-6 ${
                  modoOscuro
                    ? 'border-slate-800'
                    : 'border-gray-200'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        modoOscuro
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      Pedido #
                      {compraSeleccionada?.id_pedido ??
                        compraSeleccionada?.id ??
                        '—'}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        modoOscuro
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {compraSeleccionada?.estado ||
                        'Pagado'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold sm:text-2xl">
                    Detalles de la compra
                  </h3>

                  <p
                    className={`mt-1 text-sm ${textoSecundario}`}
                  >
                    {formatearFecha(
                      obtenerFechaCompra(
                        compraSeleccionada
                      )
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarDetalles}
                  aria-label="Cerrar"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                    modoOscuro
                      ? 'text-gray-400 hover:bg-slate-800 hover:text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <X size={22} />
                </button>
              </div>

              {/* CONTENIDO MODAL */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-4">
                  {obtenerProductosCompra(
                    compraSeleccionada
                  ).map((producto, indice) => {
                    const nombre =
                      obtenerNombreProducto(producto)

                    const precio =
                      obtenerPrecioProducto(producto)

                    const cantidad =
                      Number(
                        producto?.cantidad ??
                          producto?.quantity ??
                          1
                      )

                    const imagen =
                      obtenerImagenProducto(producto)

                    const subtotal =
                      precio * cantidad

                    return (
                      <div
                        key={indice}
                        className={`grid grid-cols-1 gap-5 rounded-2xl border p-5 lg:grid-cols-[110px_minmax(0,1fr)_180px] lg:items-center ${
                          modoOscuro
                            ? 'border-slate-800 bg-slate-950'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        {/* IMAGEN */}
                        <div
                          className={`mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl lg:mx-0 ${
                            modoOscuro
                              ? 'bg-slate-900'
                              : 'bg-white'
                          }`}
                        >
                          {imagen ? (
                            <img
                              src={imagen}
                              alt={nombre}
                              className="h-full w-full object-contain p-3"
                            />
                          ) : (
                            <Package
                              size={35}
                              className={
                                textoSecundario
                              }
                            />
                          )}
                        </div>

                        {/* INFORMACIÓN */}
                        <div className="min-w-0 text-center lg:text-left">
                          <h4 className="break-words text-lg font-bold">
                            {nombre}
                          </h4>

                          <div
                            className={`mt-3 flex flex-wrap justify-center gap-2 text-sm lg:justify-start`}
                          >
                            <span
                              className={`rounded-full px-3 py-1 ${
                                modoOscuro
                                  ? 'bg-slate-800 text-gray-300'
                                  : 'bg-white text-gray-600'
                              }`}
                            >
                              Cantidad: {cantidad}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 ${
                                modoOscuro
                                  ? 'bg-slate-800 text-gray-300'
                                  : 'bg-white text-gray-600'
                              }`}
                            >
                              Unitario:{' '}
                              {formatearPrecio(
                                precio
                              )}
                            </span>
                          </div>
                        </div>

                        {/* SUBTOTAL */}
                        <div className="border-t pt-4 text-center lg:border-l lg:border-t-0 lg:pl-5 lg:text-right">
                          <p
                            className={`text-sm ${textoSecundario}`}
                          >
                            Subtotal
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            {formatearPrecio(
                              subtotal
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* TOTAL */}
                <div
                  className={`mt-6 rounded-2xl border p-5 sm:p-6 ${
                    modoOscuro
                      ? 'border-slate-800 bg-slate-950'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          modoOscuro
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        <CreditCard size={21} />
                      </div>

                      <div>
                        <p
                          className={`text-sm ${textoSecundario}`}
                        >
                          Total pagado
                        </p>

                        <p className="font-semibold">
                          Compra realizada
                        </p>
                      </div>
                    </div>

                    <p className="text-2xl font-bold sm:text-3xl">
                      {formatearPrecio(
                        obtenerTotalCompra(
                          compraSeleccionada
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER MODAL */}
              <div
                className={`flex shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end sm:p-5 ${
                  modoOscuro
                    ? 'border-slate-800'
                    : 'border-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => descargarFactura(compraSeleccionada)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  <Download size={18} />
                  Descargar factura
                </button>

                <button
                  type="button"
                  onClick={cerrarDetalles}
                  className={`w-full rounded-2xl px-5 py-3 font-semibold transition sm:w-auto ${
                    modoOscuro
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}