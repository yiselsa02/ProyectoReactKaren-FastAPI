import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  User,
  LayoutDashboard,
  X,
  Package,
  CalendarDays,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  RefreshCw,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { jsPDF } from 'jspdf'
import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'
import { API_URL } from '../config'

const COMPRAS_KEY = 'cellworld_compras'

function obtenerClaveFavoritos(usuario) {
  return usuario?.id ?? usuario?.id_usuario ?? usuario?.correo ?? usuario?.email ?? 'cliente'
}

function obtenerIdProducto(producto) {
  return (
    producto?.id_producto ??
    producto?.producto_id ??
    producto?.id ??
    producto?.producto?.id_producto ??
    producto?.producto?.id ??
    null
  )
}

function obtenerNombreProducto(producto) {
  return (
    producto?.nombre_producto ??
    producto?.nombre ??
    producto?.producto_nombre ??
    producto?.producto?.nombre_producto ??
    producto?.producto?.nombre ??
    'Producto'
  )
}

function obtenerPrecioProducto(producto) {
  const precio =
    producto?.precio_unitario ??
    producto?.precio ??
    producto?.producto?.precio_unitario ??
    producto?.producto?.precio ??
    0

  return Number(precio) || 0
}

function obtenerImagenProducto(producto) {
  return (
    producto?.imagen ??
    producto?.imagen_url ??
    producto?.url_imagen ??
    producto?.producto?.imagen ??
    producto?.producto?.imagen_url ??
    ''
  )
}

function normalizarProducto(producto) {
  return {
    ...producto,
    id_producto: obtenerIdProducto(producto),
    nombre: obtenerNombreProducto(producto),
    precio: obtenerPrecioProducto(producto),
    imagen: obtenerImagenProducto(producto),
    cantidad:
      Number(
        producto?.cantidad ??
          producto?.cantidad_producto ??
          producto?.quantity ??
          1
      ) || 1,
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
  if (!fecha) return 'Sin fecha'

  const fechaNormalizada = new Date(fecha)

  if (Number.isNaN(fechaNormalizada.getTime())) {
    return String(fecha)
  }

  return fechaNormalizada.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function obtenerTextoSeguro(valor, respaldo = '') {
  if (valor === null || valor === undefined) return respaldo
  if (typeof valor === 'string' || typeof valor === 'number') {
    return String(valor)
  }

  if (typeof valor === 'object') {
    return valor.message || valor.msg || valor.detail || respaldo
  }

  return respaldo
}

function obtenerMensajeApi(data, respaldo) {
  if (!data) return respaldo
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    return data
      .map((item) => obtenerMensajeApi(item, respaldo))
      .filter(Boolean)
      .join(', ')
  }

  if (typeof data === 'object') {
    if (Array.isArray(data.loc) && data.msg) {
      return `${data.loc[data.loc.length - 1]}: ${data.msg}`
    }

    return obtenerMensajeApi(
      data.detail || data.message || data.error || data.msg,
      respaldo
    )
  }

  return respaldo
}

function obtenerProductosCompra(compra) {
  const productos =
    compra?.detalles ??
    compra?.detalle_pedido ??
    compra?.detalle_pedidos ??
    compra?.productos ??
    compra?.items ??
    []

  if (!Array.isArray(productos)) return []

  return productos.map(normalizarProducto)
}

function obtenerTotalCompra(compra) {
  const total =
    compra?.total ??
    compra?.total_pedido ??
    compra?.total_venta ??
    compra?.valor_total ??
    compra?.monto_total

  if (total !== undefined && total !== null) {
    return Number(total) || 0
  }

  return obtenerProductosCompra(compra).reduce(
    (acumulado, producto) =>
      acumulado + producto.precio * producto.cantidad,
    0
  )
}

function obtenerSubtotalCompra(compra) {
  const subtotal =
    compra?.subtotal ??
    compra?.sub_total ??
    compra?.subtotal_pedido

  if (subtotal !== undefined && subtotal !== null) {
    return Number(subtotal) || 0
  }

  return obtenerTotalCompra(compra)
}

function obtenerDescuentoCompra(compra) {
  return Number(
    compra?.descuento ??
      compra?.descuento_total ??
      compra?.valor_descuento ??
      0
  ) || 0
}

function obtenerIvaCompra(compra) {
  return Number(
    compra?.iva ??
      compra?.impuesto ??
      compra?.valor_iva ??
      0
  ) || 0
}

function obtenerFechaCompra(compra) {
  return (
    compra?.fecha_pedido ??
    compra?.fecha ??
    compra?.created_at ??
    compra?.fecha_creacion ??
    compra?.createdAt ??
    null
  )
}

function obtenerIdCompra(compra) {
  return (
    compra?.id_pedido ??
    compra?.pedido_id ??
    compra?.id ??
    compra?.numero_factura ??
    'N/A'
  )
}

function obtenerEstadoCompra(compra) {
  return String(
    compra?.estado ??
      compra?.estado_pedido ??
      compra?.status ??
      'pendiente'
  ).toLowerCase()
}

function obtenerTextoEstado(compra) {
  const estado = obtenerEstadoCompra(compra)

  const estados = {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    confirmado: 'Confirmado',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    rechazado: 'Rechazado',
    activo: 'Activo',
    inactivo: 'Inactivo',
  }

  return estados[estado] || estado.charAt(0).toUpperCase() + estado.slice(1)
}

function obtenerEstiloEstado(compra, modoOscuro) {
  const estado = obtenerEstadoCompra(compra)

  if (estado === 'pagado' || estado === 'entregado' || estado === 'confirmado') {
    return modoOscuro
      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }

  if (estado === 'enviado') {
    return modoOscuro
      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
      : 'bg-blue-50 text-blue-700 border border-blue-200'
  }

  if (estado === 'cancelado' || estado === 'rechazado') {
    return modoOscuro
      ? 'bg-red-500/15 text-red-300 border border-red-500/30'
      : 'bg-red-50 text-red-700 border border-red-200'
  }

  return modoOscuro
    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
    : 'bg-amber-50 text-amber-700 border border-amber-200'
}

function obtenerNombreUsuario(usuario) {
  if (!usuario) return 'Cliente'

  return (
    usuario.nombre_completo ||
    usuario.nombre ||
    usuario.nombres ||
    usuario.usuario ||
    usuario.username ||
    'Cliente'
  )
}

function obtenerCorreoUsuario(usuario) {
  if (!usuario) return ''

  return usuario.correo || usuario.email || ''
}

function PanelCliente({ modoOscuro = false }) {
  const { clearCartOnLogout } = useCart()

  const [usuario, setUsuario] = useState(null)
  const [seccion, setSeccion] = useState('inicio')

  const [favoritos, setFavoritos] = useState([])
  const [favoritosCargados, setFavoritosCargados] = useState(false)

  const [compras, setCompras] = useState([])
  const [compraActual, setCompraActual] = useState(0)

  const [mostrarDetalles, setMostrarDetalles] = useState(false)
  const [compraSeleccionada, setCompraSeleccionada] = useState(null)
  const [mostrarFactura, setMostrarFactura] = useState(false)

  const [cargandoCompras, setCargandoCompras] = useState(false)
  const [pqrs, setPqrs] = useState([])
  const [cargandoPqrs, setCargandoPqrs] = useState(false)
  const [errorPqrs, setErrorPqrs] = useState('')

  const [perfil, setPerfil] = useState({
    nombre: '',
    correo: '',
  })

  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const usuarioGuardado = JSON.parse(
          localStorage.getItem('usuario') || 'null'
        )

        setUsuario(usuarioGuardado)

        if (usuarioGuardado) {
          setPerfil({
            nombre: obtenerNombreUsuario(usuarioGuardado),
            correo: obtenerCorreoUsuario(usuarioGuardado),
          })
        }
      } catch {
        setUsuario(null)
      }
    }

    cargarUsuario()

    const manejarCambioUsuario = () => {
      cargarUsuario()
    }

    window.addEventListener('usuarioCambio', manejarCambioUsuario)
    window.addEventListener('storage', manejarCambioUsuario)

    return () => {
      window.removeEventListener('usuarioCambio', manejarCambioUsuario)
      window.removeEventListener('storage', manejarCambioUsuario)
    }
  }, [])

  useEffect(() => {
    if (!usuario) {
      setFavoritos([])
      setFavoritosCargados(true)
      return
    }

    const clave = obtenerClaveFavoritos(usuario)

    try {
      const guardados = JSON.parse(
        localStorage.getItem(`cellworld_favorites_${clave}`) || '[]'
      )

      setFavoritos(Array.isArray(guardados) ? guardados : [])
    } catch {
      setFavoritos([])
    }

    setFavoritosCargados(true)
  }, [usuario])

  useEffect(() => {
    if (!favoritosCargados || !usuario) return

    const clave = obtenerClaveFavoritos(usuario)

    localStorage.setItem(
      `cellworld_favorites_${clave}`,
      JSON.stringify(favoritos)
    )
  }, [favoritos, favoritosCargados, usuario])

  useEffect(() => {
    if (seccion !== 'compras') return

    cargarCompras()
  }, [seccion])

  useEffect(() => {
    if (seccion !== 'pqrs') return

    cargarPqrs()
  }, [seccion])

  useEffect(() => {
    const cerrarConEscape = (evento) => {
      if (evento.key !== 'Escape') return

      setMostrarDetalles(false)
      setMostrarFactura(false)
    }

    window.addEventListener('keydown', cerrarConEscape)

    return () => {
      window.removeEventListener('keydown', cerrarConEscape)
    }
  }, [])

  useEffect(() => {
    if (compras.length === 0) {
      setCompraActual(0)
      return
    }

    if (compraActual >= compras.length) {
      setCompraActual(compras.length - 1)
    }
  }, [compras, compraActual])

  async function cargarCompras() {
    setCargandoCompras(true)

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        const comprasLocales = JSON.parse(
          localStorage.getItem(COMPRAS_KEY) || '[]'
        )

        setCompras(Array.isArray(comprasLocales) ? comprasLocales : [])
        return
      }

      const respuesta = await fetch(
        `${API_URL}/api/pedidos/mis-pedidos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!respuesta.ok) {
        throw new Error('No fue posible consultar las compras')
      }

      const data = await respuesta.json()

      let comprasObtenidas = []

      if (Array.isArray(data)) {
        comprasObtenidas = data
      } else if (Array.isArray(data?.pedidos)) {
        comprasObtenidas = data.pedidos
      } else if (Array.isArray(data?.data)) {
        comprasObtenidas = data.data
      } else if (Array.isArray(data?.items)) {
        comprasObtenidas = data.items
      }

      setCompras(comprasObtenidas)
      localStorage.setItem(COMPRAS_KEY, JSON.stringify(comprasObtenidas))
    } catch (error) {
      console.error(error)

      try {
        const comprasLocales = JSON.parse(
          localStorage.getItem(COMPRAS_KEY) || '[]'
        )

        setCompras(Array.isArray(comprasLocales) ? comprasLocales : [])
      } catch {
        setCompras([])
      }
    } finally {
      setCargandoCompras(false)
    }
  }

  async function cargarPqrs() {
    setCargandoPqrs(true)
    setErrorPqrs('')

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Inicia sesión para consultar tus PQR.')
      }

      const respuesta = await fetch(
      `${API_URL}/api/pqr/mis-pqrs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await respuesta.json().catch(() => null)

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeApi(
            data,
            'No fue posible consultar las PQR.'
          )
        )
      }

      setPqrs(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.pqrs)
            ? data.pqrs
            : []
      )
    } catch (error) {
      console.error(error)
      setPqrs([])
      setErrorPqrs(
        obtenerTextoSeguro(
          error?.message,
          'No fue posible consultar las PQR.'
        )
      )
    } finally {
      setCargandoPqrs(false)
    }
  }

  function cambiarSeccion(nuevaSeccion) {
    setSeccion(nuevaSeccion)

    if (nuevaSeccion === 'compras') {
      setCompraActual(0)
    }
  }

  function abrirDetalles(compra) {
    setCompraSeleccionada(compra)
    setMostrarDetalles(true)
  }

  function abrirFactura(compra) {
    setCompraSeleccionada(compra)
    setMostrarFactura(true)
  }

  function toggleFavorito(producto) {
    const normalizado = normalizarProducto(producto)
    const id = normalizado.id_producto

    if (!id) return

    setFavoritos((actuales) => {
      const existe = actuales.some(
        (item) => obtenerIdProducto(item) === id
      )

      if (existe) {
        return actuales.filter(
          (item) => obtenerIdProducto(item) !== id
        )
      }

      return [...actuales, normalizado]
    })
  }

  function eliminarFavorito(producto) {
    const id = obtenerIdProducto(producto)

    setFavoritos((actuales) =>
      actuales.filter((item) => obtenerIdProducto(item) !== id)
    )
  }

  function siguienteCompra() {
    if (compras.length === 0) return

    setCompraActual((actual) =>
      actual < compras.length - 1 ? actual + 1 : 0
    )
  }

  function anteriorCompra() {
    if (compras.length === 0) return

    setCompraActual((actual) =>
      actual > 0 ? actual - 1 : compras.length - 1
    )
  }

  function descargarFactura(compra) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')

      const idCompra = obtenerIdCompra(compra)
      const productos = obtenerProductosCompra(compra)
      const subtotal = obtenerSubtotalCompra(compra)
      const descuento = obtenerDescuentoCompra(compra)
      const iva = obtenerIvaCompra(compra)
      const total = obtenerTotalCompra(compra)

      const nombreCliente = obtenerNombreUsuario(usuario)
      const correoCliente = obtenerCorreoUsuario(usuario)
      const fecha = formatearFecha(obtenerFechaCompra(compra))
      const estado = obtenerTextoEstado(compra)

      const anchoPagina = pdf.internal.pageSize.getWidth()
      const altoPagina = pdf.internal.pageSize.getHeight()

      pdf.setFillColor(37, 99, 235)
      pdf.rect(0, 0, anchoPagina, 30, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(22)
      pdf.setFont('helvetica', 'bold')
      pdf.text('CellWorld', 15, 18)

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Factura / Comprobante de compra', 15, 24)

      pdf.setTextColor(30, 41, 59)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Factura #${idCompra}`, 15, 42)

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')

      pdf.text(`Fecha: ${fecha}`, 15, 49)
      pdf.text(`Cliente: ${nombreCliente}`, 15, 56)
      pdf.text(`Correo: ${correoCliente || 'No registrado'}`, 15, 63)

      pdf.setFont('helvetica', 'bold')
      pdf.text('Estado:', anchoPagina - 65, 49)

      pdf.setFont('helvetica', 'normal')
      pdf.text(estado, anchoPagina - 65, 56)

      let y = 78

      pdf.setFillColor(241, 245, 249)
      pdf.rect(15, y - 6, anchoPagina - 30, 10, 'F')

      pdf.setTextColor(30, 41, 59)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Producto', 18, y)
      pdf.text('Cant.', 120, y)
      pdf.text('Precio', 143, y)
      pdf.text('Total', 175, y)

      y += 10

      pdf.setFont('helvetica', 'normal')

      if (productos.length === 0) {
        pdf.text('No hay productos registrados.', 18, y)
        y += 10
      } else {
        productos.forEach((producto) => {
          if (y > altoPagina - 50) {
            pdf.addPage()
            y = 20

            pdf.setFillColor(241, 245, 249)
            pdf.rect(15, y - 6, anchoPagina - 30, 10, 'F')

            pdf.setFont('helvetica', 'bold')
            pdf.text('Producto', 18, y)
            pdf.text('Cant.', 120, y)
            pdf.text('Precio', 143, y)
            pdf.text('Total', 175, y)

            y += 10
            pdf.setFont('helvetica', 'normal')
          }

          const nombre = obtenerNombreProducto(producto)
          const cantidad = producto.cantidad
          const precio = obtenerPrecioProducto(producto)
          const totalProducto = precio * cantidad

          pdf.text(String(nombre).substring(0, 45), 18, y)
          pdf.text(String(cantidad), 120, y)
          pdf.text(formatearPrecio(precio), 143, y)
          pdf.text(formatearPrecio(totalProducto), 175, y)

          y += 8
        })
      }

      y += 5

      pdf.setDrawColor(203, 213, 225)
      pdf.line(120, y, anchoPagina - 15, y)

      y += 8

      pdf.setFont('helvetica', 'normal')
      pdf.text('Subtotal:', 135, y)
      pdf.text(formatearPrecio(subtotal), 175, y)

      if (descuento > 0) {
        y += 7
        pdf.text('Descuento:', 135, y)
        pdf.text(`-${formatearPrecio(descuento)}`, 175, y)
      }

      if (iva > 0) {
        y += 7
        pdf.text('IVA:', 135, y)
        pdf.text(formatearPrecio(iva), 175, y)
      }

      y += 9

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('TOTAL:', 135, y)
      pdf.text(formatearPrecio(total), 175, y)

      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 116, 139)
      pdf.text(
        'Gracias por comprar en CellWorld.',
        15,
        altoPagina - 18
      )

      pdf.text(
        'Comprobante generado digitalmente.',
        15,
        altoPagina - 12
      )

      pdf.save(`Factura_CellWorld_${idCompra}.pdf`)
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert(
        'No fue posible generar el PDF. Verifica que jsPDF esté instalado con: npm.cmd install jspdf'
      )
    }
  }

  const fondoPrincipal = modoOscuro
    ? 'bg-slate-950 text-slate-100'
    : 'bg-slate-50 text-slate-900'

  const fondoSidebar = modoOscuro
    ? 'bg-slate-900'
    : 'bg-white'

  const fondoTarjeta = modoOscuro
    ? 'bg-slate-900'
    : 'bg-white'

  const bordeTarjeta = modoOscuro
    ? 'border-slate-800'
    : 'border-slate-200'

  const textoSecundario = modoOscuro
    ? 'text-slate-400'
    : 'text-slate-500'

  const textoPrincipal = modoOscuro
    ? 'text-white'
    : 'text-slate-900'

  const hoverMenu = modoOscuro
    ? 'hover:bg-slate-800'
    : 'hover:bg-slate-100'

  const menuActivo = modoOscuro
    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30'
    : 'bg-blue-600 text-white shadow-lg shadow-blue-200'

  const compra =
    compras.length > 0 && compras[compraActual]
      ? compras[compraActual]
      : null

  return (
    <div className={`min-h-screen ${fondoPrincipal}`}>
      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-[245px] ${fondoSidebar} flex flex-col`}
      >
        <div className="px-6 pt-7 pb-6">
          <img
            src={modoOscuro ? logoDark : logo}
            alt="CellWorld"
            className="h-11 w-auto object-contain"
          />
        </div>

        <div className="px-4">
          <div
            className={`mb-6 rounded-2xl p-4 ${
              modoOscuro ? 'bg-slate-800/70' : 'bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <User size={21} />
              </div>

              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${textoPrincipal}`}>
                  {obtenerNombreUsuario(usuario)}
                </p>

                <p className={`truncate text-xs ${textoSecundario}`}>
                  Cliente
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <p
            className={`mb-3 px-3 text-[11px] font-bold uppercase tracking-wider ${textoSecundario}`}
          >
            Menú
          </p>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => cambiarSeccion('inicio')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                seccion === 'inicio'
                  ? menuActivo
                  : `${textoSecundario} ${hoverMenu}`
              }`}
            >
              <LayoutDashboard size={19} />
              Inicio
            </button>

            <button
              type="button"
              onClick={() => cambiarSeccion('compras')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                seccion === 'compras'
                  ? menuActivo
                  : `${textoSecundario} ${hoverMenu}`
              }`}
            >
              <ShoppingBag size={19} />
              Mis compras
              {compras.length > 0 && (
                <span
                  className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    seccion === 'compras'
                      ? 'bg-white/20 text-white'
                      : modoOscuro
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {compras.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cambiarSeccion('pqrs')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                seccion === 'pqrs'
                  ? menuActivo
                  : `${textoSecundario} ${hoverMenu}`
              }`}
            >
              <FileText size={19} />
              Mis PQR
              {pqrs.length > 0 && (
                <span className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  seccion === 'pqrs'
                    ? 'bg-white/20 text-white'
                    : modoOscuro
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-200 text-slate-600'
                }`}>
                  {pqrs.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cambiarSeccion('favoritos')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                seccion === 'favoritos'
                  ? menuActivo
                  : `${textoSecundario} ${hoverMenu}`
              }`}
            >
              <Heart size={19} />
              Favoritos

              {favoritos.length > 0 && (
                <span
                  className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    seccion === 'favoritos'
                      ? 'bg-white/20 text-white'
                      : modoOscuro
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {favoritos.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cambiarSeccion('perfil')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                seccion === 'perfil'
                  ? menuActivo
                  : `${textoSecundario} ${hoverMenu}`
              }`}
            >
              <User size={19} />
              Mi perfil
            </button>
          </div>
        </nav>

        <div className="px-4 pb-6">
          <Link
            to="/"
            onClick={() => {
              clearCartOnLogout?.()
            }}
            className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
              modoOscuro
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Volver al menú
          </Link>
        </div>
      </aside>

      {/* =========================================================
          CONTENIDO
      ========================================================= */}
      <main className="ml-[245px] min-h-screen">
        <div className="px-8 py-8 lg:px-10">
          {/* =====================================================
              INICIO
          ===================================================== */}
          {seccion === 'inicio' && (
            <>
              <div className="mb-8">
                <p className={`mb-2 text-sm font-medium ${textoSecundario}`}>
                  Panel del cliente
                </p>

                <h1
                  className={`text-3xl font-bold tracking-tight ${textoPrincipal}`}
                >
                  Bienvenido, {obtenerNombreUsuario(usuario)}
                </h1>

                <p className={`mt-2 text-sm ${textoSecundario}`}>
                  Administra tus compras, favoritos y datos personales.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => cambiarSeccion('compras')}
                  className={`${fondoTarjeta} ${bordeTarjeta} group rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <ShoppingBag size={22} />
                    </div>

                    <ChevronRight
                      size={20}
                      className={`${textoSecundario} transition group-hover:translate-x-1`}
                    />
                  </div>

                  <p className={`text-sm ${textoSecundario}`}>
                    Compras realizadas
                  </p>

                  <p className={`mt-1 text-2xl font-bold ${textoPrincipal}`}>
                    {compras.length}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => cambiarSeccion('favoritos')}
                  className={`${fondoTarjeta} ${bordeTarjeta} group rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500 text-white">
                      <Heart size={22} />
                    </div>

                    <ChevronRight
                      size={20}
                      className={`${textoSecundario} transition group-hover:translate-x-1`}
                    />
                  </div>

                  <p className={`text-sm ${textoSecundario}`}>
                    Productos favoritos
                  </p>

                  <p className={`mt-1 text-2xl font-bold ${textoPrincipal}`}>
                    {favoritos.length}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => cambiarSeccion('perfil')}
                  className={`${fondoTarjeta} ${bordeTarjeta} group rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <User size={22} />
                    </div>

                    <ChevronRight
                      size={20}
                      className={`${textoSecundario} transition group-hover:translate-x-1`}
                    />
                  </div>

                  <p className={`text-sm ${textoSecundario}`}>
                    Cuenta
                  </p>

                  <p
                    className={`mt-1 truncate text-base font-bold ${textoPrincipal}`}
                  >
                    {obtenerCorreoUsuario(usuario) || 'Mi perfil'}
                  </p>
                </button>
              </div>

              <div className="mt-7">
                <div
                  className={`${fondoTarjeta} ${bordeTarjeta} rounded-2xl border p-6 shadow-sm`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className={`text-lg font-bold ${textoPrincipal}`}>
                        Última compra
                      </h2>
                      <p className={`mt-1 text-sm ${textoSecundario}`}>
                        Consulta rápidamente tu pedido más reciente.
                      </p>
                    </div>

                    {compras.length > 0 && (
                      <button
                        type="button"
                        onClick={() => cambiarSeccion('compras')}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Ver compras
                        <ChevronRight size={17} />
                      </button>
                    )}
                  </div>

                  {compras.length === 0 ? (
                    <div
                      className={`rounded-xl p-8 text-center ${
                        modoOscuro ? 'bg-slate-800/50' : 'bg-slate-50'
                      }`}
                    >
                      <ShoppingBag
                        size={34}
                        className={`mx-auto mb-3 ${textoSecundario}`}
                      />

                      <p className={`font-medium ${textoPrincipal}`}>
                        Aún no tienes compras
                      </p>

                      <p className={`mt-1 text-sm ${textoSecundario}`}>
                        Cuando realices una compra aparecerá aquí.
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between ${
                        modoOscuro ? 'bg-slate-800/50' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                          <Package size={22} />
                        </div>

                        <div>
                          <p className={`font-semibold ${textoPrincipal}`}>
                            Compra #{obtenerIdCompra(compras[0])}
                          </p>

                          <p className={`mt-1 text-sm ${textoSecundario}`}>
                            {formatearFecha(obtenerFechaCompra(compras[0]))}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${obtenerEstiloEstado(
                            compras[0],
                            modoOscuro
                          )}`}
                        >
                          {obtenerTextoEstado(compras[0])}
                        </span>

                        <span
                          className={`text-base font-bold ${textoPrincipal}`}
                        >
                          {formatearPrecio(obtenerTotalCompra(compras[0]))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* =====================================================
              MIS COMPRAS
          ===================================================== */}
          {seccion === 'compras' && (
            <>
              <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className={`mb-2 text-sm font-medium ${textoSecundario}`}>
                    Cliente
                  </p>

                  <h1
                    className={`text-3xl font-bold tracking-tight ${textoPrincipal}`}
                  >
                    Mis compras
                  </h1>

                  <p className={`mt-2 text-sm ${textoSecundario}`}>
                    Consulta tus pedidos y descarga sus comprobantes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cargarCompras}
                  disabled={cargandoCompras}
                  className={`flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    modoOscuro
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <RefreshCw
                    size={17}
                    className={cargandoCompras ? 'animate-spin' : ''}
                  />
                  Actualizar
                </button>
              </div>

              {cargandoCompras ? (
                <div
                  className={`${fondoTarjeta} ${bordeTarjeta} flex min-h-[300px] items-center justify-center rounded-2xl border shadow-sm`}
                >
                  <div className="text-center">
                    <RefreshCw
                      size={32}
                      className="mx-auto mb-3 animate-spin text-blue-600"
                    />

                    <p className={`font-medium ${textoPrincipal}`}>
                      Cargando compras...
                    </p>
                  </div>
                </div>
              ) : compras.length === 0 ? (
                <div
                  className={`${fondoTarjeta} ${bordeTarjeta} rounded-2xl border p-12 text-center shadow-sm`}
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <ShoppingBag size={30} />
                  </div>

                  <h2 className={`text-xl font-bold ${textoPrincipal}`}>
                    No tienes compras todavía
                  </h2>

                  <p className={`mx-auto mt-2 max-w-md text-sm ${textoSecundario}`}>
                    Cuando realices una compra, podrás consultar aquí sus
                    productos, estado, total y factura.
                  </p>
                </div>
              ) : (
                <>
                  {/* PESTAÑAS */}
                  <div
                    className={`${fondoTarjeta} ${bordeTarjeta} mb-5 rounded-2xl border p-3 shadow-sm`}
                  >
                    <div className="flex gap-2 overflow-x-auto">
                      {compras.map((item, indice) => {
                        const activa = indice === compraActual

                        return (
                          <button
                            key={`${obtenerIdCompra(item)}-${indice}`}
                            type="button"
                            onClick={() => setCompraActual(indice)}
                            className={`min-w-[145px] rounded-xl px-4 py-3 text-left transition ${
                              activa
                                ? 'bg-blue-600 text-white shadow-md'
                                : modoOscuro
                                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <p className="text-sm font-bold">
                              Compra #{obtenerIdCompra(item)}
                            </p>

                            <p
                              className={`mt-1 text-xs ${
                                activa
                                  ? 'text-blue-100'
                                  : textoSecundario
                              }`}
                            >
                              {formatearFecha(obtenerFechaCompra(item))}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {compra && (
                    <div
                      className={`${fondoTarjeta} ${bordeTarjeta} rounded-2xl border shadow-sm`}
                    >
                      <div
                        className={`flex flex-col gap-5 border-b p-6 lg:flex-row lg:items-center lg:justify-between ${
                          modoOscuro
                            ? 'border-slate-800'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <Package size={22} />
                          </div>

                          <div>
                            <h2 className={`text-lg font-bold ${textoPrincipal}`}>
                              Compra #{obtenerIdCompra(compra)}
                            </h2>

                            <div
                              className={`mt-1 flex flex-wrap items-center gap-3 text-sm ${textoSecundario}`}
                            >
                              <span className="flex items-center gap-1.5">
                                <CalendarDays size={15} />
                                {formatearFecha(
                                  obtenerFechaCompra(compra)
                                )}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerEstiloEstado(
                                  compra,
                                  modoOscuro
                                )}`}
                              >
                                {obtenerTextoEstado(compra)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => abrirDetalles(compra)}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                              modoOscuro
                                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <Eye size={17} />
                            Detalles
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirFactura(compra)}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            <FileText size={17} />
                            Factura
                          </button>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-3">
                          {obtenerProductosCompra(compra).length === 0 ? (
                            <div
                              className={`rounded-xl p-6 text-center ${
                                modoOscuro
                                  ? 'bg-slate-800/50'
                                  : 'bg-slate-50'
                              }`}
                            >
                              <p className={`text-sm ${textoSecundario}`}>
                                No hay productos registrados en esta compra.
                              </p>
                            </div>
                          ) : (
                            obtenerProductosCompra(compra).map(
                              (producto, indice) => (
                                <div
                                  key={`${obtenerIdProducto(producto)}-${indice}`}
                                  className={`flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center ${
                                    modoOscuro
                                      ? 'bg-slate-800/50'
                                      : 'bg-slate-50'
                                  }`}
                                >
                                  <div
                                    className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                                      modoOscuro
                                        ? 'bg-slate-800'
                                        : 'bg-white'
                                    }`}
                                  >
                                    {obtenerImagenProducto(producto) ? (
                                      <img
                                        src={obtenerImagenProducto(producto)}
                                        alt={obtenerNombreProducto(producto)}
                                        className="h-full w-full object-contain"
                                      />
                                    ) : (
                                      <Package
                                        size={25}
                                        className={textoSecundario}
                                      />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={`truncate font-semibold ${textoPrincipal}`}
                                    >
                                      {obtenerNombreProducto(producto)}
                                    </p>

                                    <p
                                      className={`mt-1 text-sm ${textoSecundario}`}
                                    >
                                      Cantidad: {producto.cantidad}
                                    </p>
                                  </div>

                                  <div className="text-left sm:text-right">
                                    <p
                                      className={`text-sm ${textoSecundario}`}
                                    >
                                      {formatearPrecio(
                                        obtenerPrecioProducto(producto)
                                      )}{' '}
                                      c/u
                                    </p>

                                    <p
                                      className={`mt-1 font-bold ${textoPrincipal}`}
                                    >
                                      {formatearPrecio(
                                        obtenerPrecioProducto(producto) *
                                          producto.cantidad
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )
                            )
                          )}
                        </div>

                        <div
                          className={`mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between ${
                            modoOscuro
                              ? 'border-slate-800'
                              : 'border-slate-200'
                          }`}
                        >
                          <div>
                            <p className={`text-sm ${textoSecundario}`}>
                              Total de la compra
                            </p>

                            <p
                              className={`mt-1 text-2xl font-bold ${textoPrincipal}`}
                            >
                              {formatearPrecio(obtenerTotalCompra(compra))}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={anteriorCompra}
                              disabled={compras.length <= 1}
                              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                modoOscuro
                                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <ChevronLeft size={18} />
                              Anterior
                            </button>

                            <button
                              type="button"
                              onClick={siguienteCompra}
                              disabled={compras.length <= 1}
                              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                modoOscuro
                                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              Siguiente
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* =====================================================
              FAVORITOS
          ===================================================== */}
          {seccion === 'pqrs' && (
            <>
              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={`mb-2 text-sm font-medium ${textoSecundario}`}>
                    Atención al cliente
                  </p>
                  <h1 className={`text-3xl font-bold tracking-tight ${textoPrincipal}`}>
                    Mis PQR
                  </h1>
                  <p className={`mt-2 text-sm ${textoSecundario}`}>
                    Consulta el estado y las respuestas a tus solicitudes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cargarPqrs}
                  disabled={cargandoPqrs}
                  className={`flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                    modoOscuro
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <RefreshCw size={17} className={cargandoPqrs ? 'animate-spin' : ''} />
                  Actualizar
                </button>
              </div>

              {cargandoPqrs ? (
                <div className={`${fondoTarjeta} ${bordeTarjeta} flex min-h-[280px] items-center justify-center rounded-2xl border shadow-sm`}>
                  <RefreshCw size={30} className="animate-spin text-blue-600" />
                </div>
              ) : errorPqrs ? (
                <div className={`${fondoTarjeta} ${bordeTarjeta} rounded-2xl border p-10 text-center shadow-sm`}>
                  <p className="font-semibold text-red-500">{errorPqrs}</p>
                </div>
              ) : pqrs.length === 0 ? (
                <div className={`${fondoTarjeta} ${bordeTarjeta} rounded-2xl border p-12 text-center shadow-sm`}>
                  <FileText size={30} className="mx-auto mb-4 text-blue-600" />
                  <h2 className={`text-xl font-bold ${textoPrincipal}`}>No tienes PQR registradas</h2>
                  <p className={`mx-auto mt-2 max-w-md text-sm ${textoSecundario}`}>
                    Puedes enviar una petición, queja, reclamo o sugerencia desde Contacto.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pqrs.map((pqr) => {
                    const pendiente = !['respondida', 'resuelta', 'cerrada'].includes(String(pqr.estado || '').toLowerCase())
                    return (
                      <article key={pqr.id_pqr} className={`${fondoTarjeta} ${bordeTarjeta} rounded-2xl border p-6 shadow-sm`}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className={`text-sm font-medium ${textoSecundario}`}>
                              PQR #{pqr.id_pqr} · {pqr.tipo || 'Solicitud'}
                            </p>
                            <h2 className={`mt-1 text-lg font-bold ${textoPrincipal}`}>
                              {obtenerTextoSeguro(pqr.asunto, 'Sin asunto')}
                            </h2>
                            <p className={`mt-2 whitespace-pre-wrap text-sm ${textoSecundario}`}>
                              {obtenerTextoSeguro(pqr.descripcion, 'Sin descripción')}
                            </p>
                          </div>
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${pendiente ? (modoOscuro ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700') : (modoOscuro ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700')}`}>
                            {pqr.estado || 'Pendiente'}
                          </span>
                        </div>
                        <div className={`mt-5 rounded-xl p-4 ${modoOscuro ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                          <p className={`text-xs font-bold uppercase tracking-wider ${textoSecundario}`}>Respuesta de CellWorld</p>
                          <p className={`mt-2 whitespace-pre-wrap text-sm ${textoPrincipal}`}>
                            {obtenerTextoSeguro(
                              pqr.respuesta,
                              'Aún no hay respuesta. Tu solicitud está siendo revisada.'
                            )}
                          </p>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {seccion === 'favoritos' && (
            <>
              <div className="mb-7">
                <p className={`mb-2 text-sm font-medium ${textoSecundario}`}>
                  Productos guardados
                </p>

                <h1
                  className={`text-3xl font-bold tracking-tight ${textoPrincipal}`}
                >
                  Mis favoritos
                </h1>

                <p className={`mt-2 text-sm ${textoSecundario}`}>
                  Aquí encontrarás los productos que hayas guardado.
                </p>
              </div>

              {favoritos.length === 0 ? (
                <div
                  className={`${fondoTarjeta} ${bordeTarjeta} rounded-2xl border p-12 text-center shadow-sm`}
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500 text-white">
                    <Heart size={30} />
                  </div>

                  <h2 className={`text-xl font-bold ${textoPrincipal}`}>
                    No tienes favoritos
                  </h2>

                  <p className={`mt-2 text-sm ${textoSecundario}`}>
                    Los productos que marques como favoritos aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {favoritos.map((producto, indice) => (
                    <div
                      key={`${obtenerIdProducto(producto)}-${indice}`}
                      className={`${fondoTarjeta} ${bordeTarjeta} overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                    >
                      <div
                        className={`flex h-52 items-center justify-center p-6 ${
                          modoOscuro ? 'bg-slate-800/50' : 'bg-slate-50'
                        }`}
                      >
                        {obtenerImagenProducto(producto) ? (
                          <img
                            src={obtenerImagenProducto(producto)}
                            alt={obtenerNombreProducto(producto)}
                            className="h-full max-w-full object-contain"
                          />
                        ) : (
                          <Package
                            size={55}
                            className={textoSecundario}
                          />
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3
                              className={`truncate font-bold ${textoPrincipal}`}
                            >
                              {obtenerNombreProducto(producto)}
                            </h3>

                            <p className={`mt-2 text-lg font-bold text-blue-600`}>
                              {formatearPrecio(
                                obtenerPrecioProducto(producto)
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => eliminarFavorito(producto)}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                              modoOscuro
                                ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                            title="Eliminar de favoritos"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* =====================================================
              PERFIL
          ===================================================== */}
          {seccion === 'perfil' && (
            <>
              <div className="mb-7">
                <p className={`mb-2 text-sm font-medium ${textoSecundario}`}>
                  Cuenta
                </p>

                <h1
                  className={`text-3xl font-bold tracking-tight ${textoPrincipal}`}
                >
                  Mi perfil
                </h1>

                <p className={`mt-2 text-sm ${textoSecundario}`}>
                  Información de tu cuenta de CellWorld.
                </p>
              </div>

              <div
                className={`${fondoTarjeta} ${bordeTarjeta} max-w-3xl rounded-2xl border p-7 shadow-sm`}
              >
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <User size={30} />
                  </div>

                  <div>
                    <h2 className={`text-xl font-bold ${textoPrincipal}`}>
                      {obtenerNombreUsuario(usuario)}
                    </h2>

                    <p className={`mt-1 text-sm ${textoSecundario}`}>
                      Cliente CellWorld
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div
                    className={`rounded-xl p-5 ${
                      modoOscuro ? 'bg-slate-800/50' : 'bg-slate-50'
                    }`}
                  >
                    <p
                      className={`mb-2 text-xs font-bold uppercase tracking-wider ${textoSecundario}`}
                    >
                      Nombre
                    </p>

                    <p className={`font-semibold ${textoPrincipal}`}>
                      {perfil.nombre || 'No registrado'}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-5 ${
                      modoOscuro ? 'bg-slate-800/50' : 'bg-slate-50'
                    }`}
                  >
                    <p
                      className={`mb-2 text-xs font-bold uppercase tracking-wider ${textoSecundario}`}
                    >
                      Correo electrónico
                    </p>

                    <p
                      className={`break-all font-semibold ${textoPrincipal}`}
                    >
                      {perfil.correo || 'No registrado'}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-5 ${
                      modoOscuro ? 'bg-slate-800/50' : 'bg-slate-50'
                    }`}
                  >
                    <p
                      className={`mb-2 text-xs font-bold uppercase tracking-wider ${textoSecundario}`}
                    >
                      Rol
                    </p>

                    <p className={`font-semibold ${textoPrincipal}`}>
                      Cliente
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-5 ${
                      modoOscuro ? 'bg-slate-800/50' : 'bg-slate-50'
                    }`}
                  >
                    <p
                      className={`mb-2 text-xs font-bold uppercase tracking-wider ${textoSecundario}`}
                    >
                      Compras
                    </p>

                    <p className={`font-semibold ${textoPrincipal}`}>
                      {compras.length} realizadas
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* =========================================================
          MODAL DETALLES
      ========================================================= */}
      {mostrarDetalles && compraSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setMostrarDetalles(false)
            }
          }}
        >
          <div
            className={`${fondoTarjeta} ${bordeTarjeta} max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl`}
          >
            <div
              className={`sticky top-0 z-10 flex items-center justify-between border-b p-6 ${
                modoOscuro
                  ? 'border-slate-800 bg-slate-900'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div>
                <p className={`text-sm ${textoSecundario}`}>
                  Detalle del pedido
                </p>

                <h2 className={`mt-1 text-xl font-bold ${textoPrincipal}`}>
                  Compra #{obtenerIdCompra(compraSeleccionada)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMostrarDetalles(false)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  modoOscuro
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div
                  className={`rounded-xl p-4 ${
                    modoOscuro ? 'bg-slate-800/60' : 'bg-slate-50'
                  }`}
                >
                  <p className={`text-xs ${textoSecundario}`}>
                    Fecha
                  </p>

                  <p className={`mt-1 font-semibold ${textoPrincipal}`}>
                    {formatearFecha(
                      obtenerFechaCompra(compraSeleccionada)
                    )}
                  </p>
                </div>

                <div
                  className={`rounded-xl p-4 ${
                    modoOscuro ? 'bg-slate-800/60' : 'bg-slate-50'
                  }`}
                >
                  <p className={`text-xs ${textoSecundario}`}>
                    Estado
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${obtenerEstiloEstado(
                      compraSeleccionada,
                      modoOscuro
                    )}`}
                  >
                    {obtenerTextoEstado(compraSeleccionada)}
                  </span>
                </div>

                <div
                  className={`rounded-xl p-4 ${
                    modoOscuro ? 'bg-slate-800/60' : 'bg-slate-50'
                  }`}
                >
                  <p className={`text-xs ${textoSecundario}`}>
                    Total
                  </p>

                  <p className={`mt-1 font-bold ${textoPrincipal}`}>
                    {formatearPrecio(
                      obtenerTotalCompra(compraSeleccionada)
                    )}
                  </p>
                </div>
              </div>

              <h3 className={`mb-4 font-bold ${textoPrincipal}`}>
                Productos
              </h3>

              <div className="space-y-3">
                {obtenerProductosCompra(compraSeleccionada).map(
                  (producto, indice) => (
                    <div
                      key={`${obtenerIdProducto(producto)}-${indice}`}
                      className={`flex items-center gap-4 rounded-xl p-4 ${
                        modoOscuro
                          ? 'bg-slate-800/50'
                          : 'bg-slate-50'
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                          modoOscuro ? 'bg-slate-800' : 'bg-white'
                        }`}
                      >
                        {obtenerImagenProducto(producto) ? (
                          <img
                            src={obtenerImagenProducto(producto)}
                            alt={obtenerNombreProducto(producto)}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package
                            size={23}
                            className={textoSecundario}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-semibold ${textoPrincipal}`}
                        >
                          {obtenerNombreProducto(producto)}
                        </p>

                        <p className={`mt-1 text-sm ${textoSecundario}`}>
                          Cantidad: {producto.cantidad}
                        </p>
                      </div>

                      <p className={`font-bold ${textoPrincipal}`}>
                        {formatearPrecio(
                          obtenerPrecioProducto(producto) *
                            producto.cantidad
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL FACTURA
      ========================================================= */}
      {mostrarFactura && compraSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setMostrarFactura(false)
            }
          }}
        >
          <div
            className={`${fondoTarjeta} ${bordeTarjeta} max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl`}
          >
            <div
              className={`sticky top-0 z-10 flex items-center justify-between border-b p-6 ${
                modoOscuro
                  ? 'border-slate-800 bg-slate-900'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FileText size={21} />
                </div>

                <div>
                  <h2 className={`text-xl font-bold ${textoPrincipal}`}>
                    Factura
                  </h2>

                  <p className={`text-sm ${textoSecundario}`}>
                    Compra #{obtenerIdCompra(compraSeleccionada)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFactura(false)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  modoOscuro
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div
                className={`rounded-2xl p-6 ${
                  modoOscuro
                    ? 'bg-slate-800/50'
                    : 'bg-slate-50'
                }`}
              >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3
                      className={`text-2xl font-bold ${textoPrincipal}`}
                    >
                      CellWorld
                    </h3>

                    <p className={`mt-1 text-sm ${textoSecundario}`}>
                      Factura / Comprobante de compra
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${obtenerEstiloEstado(
                      compraSeleccionada,
                      modoOscuro
                    )}`}
                  >
                    {obtenerTextoEstado(compraSeleccionada)}
                  </span>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className={`text-xs ${textoSecundario}`}>
                      Número de factura
                    </p>

                    <p
                      className={`mt-1 font-semibold ${textoPrincipal}`}
                    >
                      #{obtenerIdCompra(compraSeleccionada)}
                    </p>
                  </div>

                  <div>
                    <p className={`text-xs ${textoSecundario}`}>
                      Fecha
                    </p>

                    <p
                      className={`mt-1 font-semibold ${textoPrincipal}`}
                    >
                      {formatearFecha(
                        obtenerFechaCompra(compraSeleccionada)
                      )}
                    </p>
                  </div>

                  <div>
                    <p className={`text-xs ${textoSecundario}`}>
                      Cliente
                    </p>

                    <p
                      className={`mt-1 font-semibold ${textoPrincipal}`}
                    >
                      {obtenerNombreUsuario(usuario)}
                    </p>
                  </div>

                  <div>
                    <p className={`text-xs ${textoSecundario}`}>
                      Correo
                    </p>

                    <p
                      className={`mt-1 break-all font-semibold ${textoPrincipal}`}
                    >
                      {obtenerCorreoUsuario(usuario) || 'No registrado'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {obtenerProductosCompra(compraSeleccionada).map(
                    (producto, indice) => (
                      <div
                        key={`${obtenerIdProducto(producto)}-${indice}`}
                        className={`flex items-center justify-between gap-4 rounded-xl p-4 ${
                          modoOscuro
                            ? 'bg-slate-900/70'
                            : 'bg-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`truncate font-semibold ${textoPrincipal}`}
                          >
                            {obtenerNombreProducto(producto)}
                          </p>

                          <p
                            className={`mt-1 text-xs ${textoSecundario}`}
                          >
                            {producto.cantidad} ×{' '}
                            {formatearPrecio(
                              obtenerPrecioProducto(producto)
                            )}
                          </p>
                        </div>

                        <p
                          className={`shrink-0 font-bold ${textoPrincipal}`}
                        >
                          {formatearPrecio(
                            obtenerPrecioProducto(producto) *
                              producto.cantidad
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div
                  className={`mt-5 border-t pt-5 ${
                    modoOscuro
                      ? 'border-slate-700'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={textoSecundario}>
                          Subtotal
                        </span>

                        <span
                          className={`font-medium ${textoPrincipal}`}
                        >
                          {formatearPrecio(
                            obtenerSubtotalCompra(compraSeleccionada)
                          )}
                        </span>
                      </div>

                      {obtenerDescuentoCompra(compraSeleccionada) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className={textoSecundario}>
                            Descuento
                          </span>

                          <span className="font-medium text-emerald-600">
                            -
                            {formatearPrecio(
                              obtenerDescuentoCompra(compraSeleccionada)
                            )}
                          </span>
                        </div>
                      )}

                      {obtenerIvaCompra(compraSeleccionada) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className={textoSecundario}>
                            IVA
                          </span>

                          <span
                            className={`font-medium ${textoPrincipal}`}
                          >
                            {formatearPrecio(
                              obtenerIvaCompra(compraSeleccionada)
                            )}
                          </span>
                        </div>
                      )}

                      <div
                        className={`mt-3 flex justify-between border-t pt-3 ${
                          modoOscuro
                            ? 'border-slate-700'
                            : 'border-slate-200'
                        }`}
                      >
                        <span
                          className={`font-bold ${textoPrincipal}`}
                        >
                          Total
                        </span>

                        <span className="text-xl font-bold text-blue-600">
                          {formatearPrecio(
                            obtenerTotalCompra(compraSeleccionada)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setMostrarFactura(false)}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                    modoOscuro
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    descargarFactura(compraSeleccionada)
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Download size={18} />
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelCliente
