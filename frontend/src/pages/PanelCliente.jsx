import { useEffect, useState } from 'react'
import {
  Heart,
  ShoppingBag,
  User,
  LayoutDashboard,
  X,
  Package,
  CalendarDays,
  Trash2,
  ShoppingCart,
  FileText,
  Download,
} from 'lucide-react'

import {
  useCart,
  generarFacturaPDF,
} from '../context/CartContext'

import { API_URL } from '../config'

const FAVORITOS_KEY = 'cellworld_favorites'
const COMPRAS_KEY = 'cellworld_compras'

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
  if (!fecha) {
    return 'Fecha no disponible'
  }

  const fechaObjeto = new Date(fecha)

  if (Number.isNaN(fechaObjeto.getTime())) {
    return String(fecha)
  }

  return fechaObjeto.toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function obtenerTextoSeguro(valor, fallback = '—') {
  const texto = String(valor ?? '').trim()

  return texto || fallback
}

function obtenerMensajeApi(data, fallback) {
  return (
    data?.detail ||
    data?.message ||
    data?.error ||
    fallback
  )
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
  if (
    compra?.total !== undefined &&
    compra?.total !== null
  ) {
    return Number(compra.total) || 0
  }

  const productos = obtenerProductosCompra(compra)

  return productos.reduce((total, producto) => {
    const precio = obtenerPrecioProducto(producto)

    const cantidad = Number(
      producto?.cantidad ??
        producto?.quantity ??
        1
    )

    return total + precio * cantidad
  }, 0)
}

function obtenerSubtotalCompra(compra) {
  if (
    compra?.subtotal !== undefined &&
    compra?.subtotal !== null
  ) {
    return Number(compra.subtotal) || 0
  }

  const productos = obtenerProductosCompra(compra)

  return productos.reduce((total, producto) => {
    const precio = obtenerPrecioProducto(producto)

    const cantidad = Number(
      producto?.cantidad ??
        producto?.quantity ??
        1
    )

    return total + precio * cantidad
  }, 0)
}

function obtenerDescuentoCompra(compra) {
  return (
    Number(
      compra?.descuento ??
        compra?.discount ??
        0
    ) || 0
  )
}

function obtenerIvaCompra(compra) {
  return (
    Number(
      compra?.iva ??
        compra?.impuesto ??
        compra?.impuestos ??
        0
    ) || 0
  )
}

function obtenerFechaCompra(compra) {
  return (
    compra?.creado_en ??
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
    compra?.id ??
    compra?.pedido_id ??
    compra?.numero_pedido ??
    null
  )
}

function obtenerEstadoCompra(compra) {
  return (
    compra?.estado ??
    compra?.status ??
    'pagado'
  )
}

function obtenerTextoEstado(compra) {
  const estado = String(
    obtenerEstadoCompra(compra)
  ).toLowerCase()

  const estados = {
    pagado: 'Pagado',
    pendiente: 'Pendiente',
    procesando: 'Procesando',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    completado: 'Completado',
    cerrado: 'Cerrado',
  }

  return (
    estados[estado] ||
    obtenerTextoSeguro(
      obtenerEstadoCompra(compra),
      'Sin estado'
    )
  )
}

function obtenerEstiloEstado(compra, modoOscuro) {
  const estado = String(
    obtenerEstadoCompra(compra)
  ).toLowerCase()

  if (
    estado === 'pagado' ||
    estado === 'completado' ||
    estado === 'entregado'
  ) {
    return modoOscuro
      ? 'bg-emerald-500/10 text-emerald-400'
      : 'bg-emerald-50 text-emerald-700'
  }

  if (
    estado === 'pendiente' ||
    estado === 'procesando'
  ) {
    return modoOscuro
      ? 'bg-amber-500/10 text-amber-400'
      : 'bg-amber-50 text-amber-700'
  }

  if (estado === 'cancelado') {
    return modoOscuro
      ? 'bg-red-500/10 text-red-400'
      : 'bg-red-50 text-red-700'
  }

  return modoOscuro
    ? 'bg-slate-800 text-slate-300'
    : 'bg-slate-100 text-slate-600'
}

function obtenerNombreUsuario(usuario) {
  if (!usuario) {
    return 'Cliente'
  }

  const nombreCompleto = [
    usuario?.nombres,
    usuario?.apellidos,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    nombreCompleto ||
    usuario?.nombre ||
    usuario?.name ||
    usuario?.usuario ||
    usuario?.username ||
    usuario?.correo ||
    usuario?.email ||
    'Cliente'
  )
}

function obtenerCorreoUsuario(usuario) {
  return (
    usuario?.correo ||
    usuario?.email ||
    usuario?.correo_electronico ||
    ''
  )
}

function obtenerClaveFavoritos(usuario) {
  return (
    usuario?.id ??
    usuario?.id_usuario ??
    usuario?.correo ??
    usuario?.email ??
    'cliente'
  )
}

export default function PanelCliente({
  modoOscuro = false,
  usuario = null,
}) {
  const { addItem } = useCart()

  const [seccion, setSeccion] = useState('resumen')

  const [favoritos, setFavoritos] = useState([])

  const [compras, setCompras] = useState([])

  const [compraActual, setCompraActual] = useState(0)

  const [compraSeleccionada, setCompraSeleccionada] =
    useState(null)

  const [mostrarFactura, setMostrarFactura] =
    useState(false)

  const [cargandoCompras, setCargandoCompras] =
    useState(false)

  const [cargandoPqrs, setCargandoPqrs] =
    useState(false)

  const [pqrs, setPqrs] = useState([])

  const [perfil, setPerfil] = useState({
    nombres: usuario?.nombres || '',
    apellidos: usuario?.apellidos || '',
    email:
      usuario?.email ||
      usuario?.correo ||
      '',
    telefono: usuario?.telefono || '',
  })

  const fondoPrincipal = modoOscuro
    ? 'bg-slate-950 text-white'
    : 'bg-gray-100 text-gray-900'

  const fondoTarjeta = modoOscuro
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-gray-200'

  const textoPrincipal = modoOscuro
    ? 'text-white'
    : 'text-gray-900'

  const textoSecundario = modoOscuro
    ? 'text-gray-400'
    : 'text-gray-500'

  const bordeTarjeta = modoOscuro
    ? 'border-slate-800'
    : 'border-gray-200'

  useEffect(() => {
    try {
      const clave = obtenerClaveFavoritos(usuario)

      const guardados = JSON.parse(
        localStorage.getItem(
          `cellworld_favorites_${clave}`
        ) ||
          localStorage.getItem(FAVORITOS_KEY) ||
          '[]'
      )

      setFavoritos(
        Array.isArray(guardados)
          ? guardados
          : []
      )
    } catch {
      setFavoritos([])
    }
  }, [usuario])

  useEffect(() => {
    if (usuario) {
      setPerfil({
        nombres: usuario?.nombres || '',
        apellidos: usuario?.apellidos || '',
        email:
          usuario?.email ||
          usuario?.correo ||
          '',
        telefono: usuario?.telefono || '',
      })
    }
  }, [usuario])

  useEffect(() => {
    try {
      const clave = obtenerClaveFavoritos(usuario)

      localStorage.setItem(
        `cellworld_favorites_${clave}`,
        JSON.stringify(favoritos)
      )

      localStorage.setItem(
        FAVORITOS_KEY,
        JSON.stringify(favoritos)
      )
    } catch {
      // No hacer nada si localStorage no está disponible.
    }
  }, [favoritos, usuario])

  useEffect(() => {
    const actualizarFavoritos = () => {
      try {
        const clave = obtenerClaveFavoritos(usuario)

        const guardados = JSON.parse(
          localStorage.getItem(
            `cellworld_favorites_${clave}`
          ) ||
            localStorage.getItem(FAVORITOS_KEY) ||
            '[]'
        )

        setFavoritos(
          Array.isArray(guardados)
            ? guardados
            : []
        )
      } catch {
        setFavoritos([])
      }
    }

    window.addEventListener(
      'cellworld-favorites-updated',
      actualizarFavoritos
    )

    window.addEventListener(
      'storage',
      actualizarFavoritos
    )

    window.addEventListener(
      'focus',
      actualizarFavoritos
    )

    return () => {
      window.removeEventListener(
        'cellworld-favorites-updated',
        actualizarFavoritos
      )

      window.removeEventListener(
        'storage',
        actualizarFavoritos
      )

      window.removeEventListener(
        'focus',
        actualizarFavoritos
      )
    }
  }, [usuario])

  useEffect(() => {
    if (seccion === 'compras') {
      cargarCompras()
    }
  }, [seccion])

  useEffect(() => {
    if (seccion === 'pqr') {
      cargarPqrs()
    }
  }, [seccion])

  useEffect(() => {
    const manejarEscape = (evento) => {
      if (evento.key === 'Escape') {
        setMostrarFactura(false)
      }
    }

    document.addEventListener(
      'keydown',
      manejarEscape
    )

    return () => {
      document.removeEventListener(
        'keydown',
        manejarEscape
      )
    }
  }, [])

  async function cargarCompras() {
    setCargandoCompras(true)

    const token =
      localStorage.getItem('token')

    try {
      if (!token) {
        const comprasLocales =
          JSON.parse(
            localStorage.getItem(
              COMPRAS_KEY
            ) || '[]'
          )

        setCompras(
          Array.isArray(comprasLocales)
            ? comprasLocales
            : []
        )

        setCompraActual(0)

        return
      }

      const respuesta = await fetch(
        `${API_URL}/api/pedidos/mis-pedidos`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
        }
      )

      const data =
        await respuesta.json().catch(
          () => null
        )

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeApi(
            data,
            'No se pudieron cargar las compras.'
          )
        )
      }

      let pedidos = []

      if (Array.isArray(data)) {
        pedidos = data
      } else if (
        Array.isArray(data?.pedidos)
      ) {
        pedidos = data.pedidos
      } else if (
        Array.isArray(data?.data)
      ) {
        pedidos = data.data
      } else if (
        Array.isArray(data?.items)
      ) {
        pedidos = data.items
      }

      setCompras(pedidos)
      setCompraActual(0)

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
        const comprasLocales =
          JSON.parse(
            localStorage.getItem(
              COMPRAS_KEY
            ) || '[]'
          )

        setCompras(
          Array.isArray(comprasLocales)
            ? comprasLocales
            : []
        )

        setCompraActual(0)
      } catch {
        setCompras([])
      }
    } finally {
      setCargandoCompras(false)
    }
  }

  async function cargarPqrs() {
    setCargandoPqrs(true)

    const token =
      localStorage.getItem('token')

    if (!token) {
      setPqrs([])
      setCargandoPqrs(false)
      return
    }

    try {
      const respuesta = await fetch(
        `${API_URL}/api/pqrs/mis-pqrs`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
        }
      )

      const data =
        await respuesta.json().catch(
          () => null
        )

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeApi(
            data,
            'No se pudieron cargar las PQR.'
          )
        )
      }

      if (Array.isArray(data)) {
        setPqrs(data)
      } else if (
        Array.isArray(data?.pqrs)
      ) {
        setPqrs(data.pqrs)
      } else if (
        Array.isArray(data?.data)
      ) {
        setPqrs(data.data)
      } else if (
        Array.isArray(data?.items)
      ) {
        setPqrs(data.items)
      } else {
        setPqrs([])
      }
    } catch (error) {
      console.error(
        'Error cargando PQR:',
        error
      )

      setPqrs([])
    } finally {
      setCargandoPqrs(false)
    }
  }

  function quitarFavorito(id) {
    setFavoritos((actuales) =>
      actuales.filter(
        (producto) =>
          String(
            obtenerIdProducto(producto)
          ) !== String(id)
      )
    )

    window.dispatchEvent(
      new Event(
        'cellworld-favorites-updated'
      )
    )
  }

  function agregarFavoritoAlCarrito(
    producto
  ) {
    const productoNormalizado =
      normalizarProducto(producto)

    addItem(productoNormalizado)
  }

  function abrirFactura(compra) {
    setCompraSeleccionada(compra)
    setMostrarFactura(true)
  }

  function descargarFactura(compra) {
    try {
      generarFacturaPDF(
        compra,
        usuario
      )
    } catch (error) {
      console.error(
        'Error generando factura:',
        error
      )

      alert(
        'No se pudo generar la factura PDF.'
      )
    }
  }

  const nombreUsuario =
    obtenerNombreUsuario(usuario)

  const totalFavoritos =
    favoritos.length

  const totalCompras =
    compras.length

  const compra =
    compras[compraActual] || null

  const botonMenuBase =
    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition'

  const botonMenuActivo =
    'bg-blue-600 text-white shadow-md'

  const botonMenuInactivo = modoOscuro
    ? 'text-gray-300 hover:bg-slate-800'
    : 'text-gray-700 hover:bg-gray-100'

  return (
    <div
      className={`min-h-screen w-full ${fondoPrincipal}`}
    >
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* =====================================================
            ENCABEZADO
        ===================================================== */}

        <div
          className={`mb-6 rounded-3xl border p-5 shadow-sm sm:p-6 ${fondoTarjeta}`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="min-w-0">
              <p
                className={`mb-1 text-sm font-medium ${textoSecundario}`}
              >
                Panel de cliente
              </p>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Hola, {nombreUsuario} 👋
              </h1>

              <p
                className={`mt-2 text-sm sm:text-base ${textoSecundario}`}
              >
                Administra tus compras,
                productos seleccionados y
                tu perfil.
              </p>
            </div>

            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                modoOscuro
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <User size={28} />
            </div>

          </div>
        </div>

        {/* =====================================================
            CONTENIDO
        ===================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)]">

          {/* =====================================================
              MENÚ LATERAL
          ===================================================== */}

          <aside className="h-fit lg:sticky lg:top-6">
            <nav className="flex flex-col gap-1">

              <button
                type="button"
                onClick={() =>
                  setSeccion('resumen')
                }
                className={`${botonMenuBase} ${
                  seccion === 'resumen'
                    ? botonMenuActivo
                    : botonMenuInactivo
                }`}
              >
                <LayoutDashboard size={19} />
                <span>Resumen</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSeccion('compras')
                }
                className={`${botonMenuBase} ${
                  seccion === 'compras'
                    ? botonMenuActivo
                    : botonMenuInactivo
                }`}
              >
                <ShoppingBag size={19} />

                <span>Mis compras</span>

                {totalCompras > 0 && (
                  <span
                    className={`ml-auto flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                      seccion === 'compras'
                        ? 'bg-white/20 text-white'
                        : modoOscuro
                          ? 'bg-slate-700 text-gray-200'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {totalCompras}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setSeccion('seleccionados')
                }
                className={`${botonMenuBase} ${
                  seccion === 'seleccionados'
                    ? botonMenuActivo
                    : botonMenuInactivo
                }`}
              >
                <Heart size={19} />

                <span>
                  Mis seleccionados
                </span>

                {totalFavoritos > 0 && (
                  <span
                    className={`ml-auto flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                      seccion === 'seleccionados'
                        ? 'bg-white/20 text-white'
                        : modoOscuro
                          ? 'bg-slate-700 text-gray-200'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {totalFavoritos}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setSeccion('perfil')
                }
                className={`${botonMenuBase} ${
                  seccion === 'perfil'
                    ? botonMenuActivo
                    : botonMenuInactivo
                }`}
              >
                <User size={19} />
                <span>Mi perfil</span>
              </button>

            </nav>
          </aside>

          {/* =====================================================
              MAIN
          ===================================================== */}

          <main className="min-w-0">

            {/* =================================================
                RESUMEN
            ================================================= */}

            {seccion === 'resumen' && (
              <section>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Resumen
                  </h2>

                  <p
                    className={`mt-1 ${textoSecundario}`}
                  >
                    Aquí puedes consultar
                    rápidamente tu actividad
                    en CellWorld.
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
                      {perfil.email ||
                        'Cliente'}
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
                        Explora nuestro catálogo
                        y encuentra tu próximo
                        celular.
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

            {/* =================================================
                MIS COMPRAS
            ================================================= */}

            {seccion === 'compras' && (
              <section>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Mis compras
                  </h2>

                  <p
                    className={`mt-1 ${textoSecundario}`}
                  >
                    Consulta el historial de
                    tus pedidos realizados.
                  </p>
                </div>

                {cargandoCompras ? (
                  <div
                    className={`rounded-3xl border p-10 text-center ${fondoTarjeta}`}
                  >
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

                    <p
                      className={textoSecundario}
                    >
                      Cargando tus compras...
                    </p>
                  </div>
                ) : compras.length === 0 ? (
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
                      <Package size={30} />
                    </div>

                    <h3 className="text-xl font-bold">
                      Aún no tienes compras
                    </h3>

                    <p
                      className={`mx-auto mt-2 max-w-md ${textoSecundario}`}
                    >
                      Cuando realices una
                      compra, aparecerá aquí
                      junto con la información
                      de la operación.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href =
                          '/productos'
                      }}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      <ShoppingCart size={18} />
                      Ir al catálogo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">

                    {/* PESTAÑAS DE COMPRAS */}

                    <div
                      className={`rounded-2xl border p-2 ${fondoTarjeta}`}
                    >
                      <div className="flex gap-2 overflow-x-auto">

                        {compras.map(
                          (item, indice) => (
                            <button
                              key={
                                item?.id_pedido ??
                                item?.id ??
                                indice
                              }
                              type="button"
                              onClick={() =>
                                setCompraActual(
                                  indice
                                )
                              }
                              className={`min-w-fit rounded-xl px-4 py-3 text-left transition ${
                                compraActual ===
                                indice
                                  ? 'bg-blue-600 text-white'
                                  : modoOscuro
                                    ? 'text-slate-300 hover:bg-slate-800'
                                    : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ShoppingBag size={16} />

                                <span className="font-semibold">
                                  Compra #
                                  {obtenerIdCompra(
                                    item
                                  ) ??
                                    indice + 1}
                                </span>
                              </div>

                              <p
                                className={`mt-1 text-xs ${
                                  compraActual ===
                                  indice
                                    ? 'text-white/80'
                                    : textoSecundario
                                }`}
                              >
                                {formatearFecha(
                                  obtenerFechaCompra(
                                    item
                                  )
                                )}
                              </p>
                            </button>
                          )
                        )}

                      </div>
                    </div>

                    {/* COMPRA SELECCIONADA */}

                    {compra && (
                      <div
                        className={`${fondoTarjeta} ${bordeTarjeta} rounded-2xl border shadow-sm`}
                      >
                        <div className="p-6">

                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex items-center gap-4">

                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <ShoppingBag size={24} />
                              </div>

                              <div>
                                <h2
                                  className={`text-lg font-bold ${textoPrincipal}`}
                                >
                                  Compra #
                                  {obtenerIdCompra(
                                    compra
                                  )}
                                </h2>

                                <div
                                  className={`mt-2 flex flex-wrap items-center gap-3 text-sm ${textoSecundario}`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <CalendarDays size={15} />

                                    {formatearFecha(
                                      obtenerFechaCompra(
                                        compra
                                      )
                                    )}
                                  </span>

                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerEstiloEstado(
                                      compra,
                                      modoOscuro
                                    )}`}
                                  >
                                    {obtenerTextoEstado(
                                      compra
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">

                              <div>
                                <p
                                  className={`text-xs ${textoSecundario}`}
                                >
                                  Productos
                                </p>

                                <p
                                  className={`mt-1 font-semibold ${textoPrincipal}`}
                                >
                                  {
                                    obtenerProductosCompra(
                                      compra
                                    ).length
                                  }
                                </p>
                              </div>

                              <div>
                                <p
                                  className={`text-xs ${textoSecundario}`}
                                >
                                  Total
                                </p>

                                <p
                                  className={`mt-1 text-lg font-bold ${textoPrincipal}`}
                                >
                                  {formatearPrecio(
                                    obtenerTotalCompra(
                                      compra
                                    )
                                  )}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  abrirFactura(
                                    compra
                                  )
                                }
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                              >
                                <FileText size={17} />
                                Factura
                              </button>

                            </div>
                          </div>

                          <div
                            className={`mt-6 flex items-center justify-between border-t pt-5 ${
                              modoOscuro
                                ? 'border-slate-800'
                                : 'border-slate-200'
                            }`}
                          >
                            <p
                              className={`text-sm ${textoSecundario}`}
                            >
                              Compra{' '}
                              {compraActual +
                                1}{' '}
                              de{' '}
                              {compras.length}
                            </p>

                            <div className="flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  setCompraActual(
                                    (actual) =>
                                      Math.max(
                                        0,
                                        actual - 1
                                      )
                                  )
                                }
                                disabled={
                                  compraActual ===
                                  0
                                }
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                  compraActual ===
                                  0
                                    ? 'cursor-not-allowed opacity-40'
                                    : modoOscuro
                                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                Anterior
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setCompraActual(
                                    (actual) =>
                                      Math.min(
                                        compras.length -
                                          1,
                                        actual + 1
                                      )
                                  )
                                }
                                disabled={
                                  compraActual >=
                                  compras.length -
                                    1
                                }
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                  compraActual >=
                                  compras.length -
                                    1
                                    ? 'cursor-not-allowed opacity-40'
                                    : modoOscuro
                                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                Siguiente
                              </button>

                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                )}

              </section>
            )}

            {/* =================================================
                MIS SELECCIONADOS
            ================================================= */}

            {seccion === 'seleccionados' && (
              <section>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Mis seleccionados
                  </h2>

                  <p
                    className={`mt-1 ${textoSecundario}`}
                  >
                    Aquí encontrarás los
                    productos que marcaste como
                    favoritos.
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
                      No tienes productos
                      seleccionados
                    </h3>

                    <p
                      className={`mx-auto mt-2 max-w-md ${textoSecundario}`}
                    >
                      Presiona el corazón en
                      cualquier producto para
                      guardarlo aquí.
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
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                    {favoritos.map(
                      (
                        producto,
                        indice
                      ) => {
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
                                  quitarFavorito(
                                    id
                                  )
                                }
                                title="Quitar de seleccionados"
                                className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition hover:scale-105 ${
                                  modoOscuro
                                    ? 'bg-slate-900 text-red-400 hover:bg-red-500/10'
                                    : 'bg-white text-red-500 hover:bg-red-50'
                                }`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="p-5">
                              <h3 className="truncate text-lg font-bold">
                                {nombre}
                              </h3>

                              <p
                                className={`mt-2 text-xl font-bold ${
                                  modoOscuro
                                    ? 'text-blue-400'
                                    : 'text-blue-600'
                                }`}
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
                                <ShoppingCart size={18} />
                                Agregar al carrito
                              </button>
                            </div>
                          </article>
                        )
                      }
                    )}

                  </div>
                )}

              </section>
            )}

            {/* =================================================
                PERFIL
            ================================================= */}

            {seccion === 'perfil' && (
              <section>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Mi perfil
                  </h2>

                  <p
                    className={`mt-1 ${textoSecundario}`}
                  >
                    Información de tu cuenta
                    en CellWorld.
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

          </main>

        </div>
      </div>

      {/* =========================================================
          MODAL FACTURA
      ========================================================= */}

      {mostrarFactura &&
        compraSeleccionada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(evento) => {
              if (
                evento.target ===
                evento.currentTarget
              ) {
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
                    <h2
                      className={`text-xl font-bold ${textoPrincipal}`}
                    >
                      Factura
                    </h2>

                    <p
                      className={`text-sm ${textoSecundario}`}
                    >
                      Compra #
                      {obtenerIdCompra(
                        compraSeleccionada
                      )}
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarFactura(false)
                  }
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

                      <p
                        className={`mt-1 text-sm ${textoSecundario}`}
                      >
                        Factura /
                        Comprobante de compra
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${obtenerEstiloEstado(
                        compraSeleccionada,
                        modoOscuro
                      )}`}
                    >
                      {obtenerTextoEstado(
                        compraSeleccionada
                      )}
                    </span>

                  </div>

                  <div className="mb-6 grid gap-4 sm:grid-cols-2">

                    <div>
                      <p
                        className={`text-xs ${textoSecundario}`}
                      >
                        Número de factura
                      </p>

                      <p
                        className={`mt-1 font-semibold ${textoPrincipal}`}
                      >
                        #
                        {obtenerIdCompra(
                          compraSeleccionada
                        )}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`text-xs ${textoSecundario}`}
                      >
                        Fecha
                      </p>

                      <p
                        className={`mt-1 font-semibold ${textoPrincipal}`}
                      >
                        {formatearFecha(
                          obtenerFechaCompra(
                            compraSeleccionada
                          )
                        )}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`text-xs ${textoSecundario}`}
                      >
                        Cliente
                      </p>

                      <p
                        className={`mt-1 font-semibold ${textoPrincipal}`}
                      >
                        {obtenerNombreUsuario(
                          usuario
                        )}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`text-xs ${textoSecundario}`}
                      >
                        Correo
                      </p>

                      <p
                        className={`mt-1 break-all font-semibold ${textoPrincipal}`}
                      >
                        {obtenerCorreoUsuario(
                          usuario
                        ) ||
                          'No registrado'}
                      </p>
                    </div>

                  </div>

                  <div className="space-y-2">

                    {obtenerProductosCompra(
                      compraSeleccionada
                    ).map(
                      (
                        producto,
                        indice
                      ) => (
                        <div
                          key={`${obtenerIdProducto(
                            producto
                          )}-${indice}`}
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
                              {obtenerNombreProducto(
                                producto
                              )}
                            </p>

                            <p
                              className={`mt-1 text-xs ${textoSecundario}`}
                            >
                              {
                                producto?.cantidad
                              }{' '}
                              ×{' '}
                              {formatearPrecio(
                                obtenerPrecioProducto(
                                  producto
                                )
                              )}
                            </p>

                          </div>

                          <p
                            className={`shrink-0 font-bold ${textoPrincipal}`}
                          >
                            {formatearPrecio(
                              obtenerPrecioProducto(
                                producto
                              ) *
                                Number(
                                  producto?.cantidad ??
                                    producto?.quantity ??
                                    1
                                )
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

                          <span
                            className={
                              textoSecundario
                            }
                          >
                            Subtotal
                          </span>

                          <span
                            className={`font-medium ${textoPrincipal}`}
                          >
                            {formatearPrecio(
                              obtenerSubtotalCompra(
                                compraSeleccionada
                              )
                            )}
                          </span>

                        </div>

                        {obtenerDescuentoCompra(
                          compraSeleccionada
                        ) > 0 && (
                          <div className="flex justify-between text-sm">

                            <span
                              className={
                                textoSecundario
                              }
                            >
                              Descuento
                            </span>

                            <span className="font-medium text-emerald-600">
                              -
                              {formatearPrecio(
                                obtenerDescuentoCompra(
                                  compraSeleccionada
                                )
                              )}
                            </span>

                          </div>
                        )}

                        {obtenerIvaCompra(
                          compraSeleccionada
                        ) > 0 && (
                          <div className="flex justify-between text-sm">

                            <span
                              className={
                                textoSecundario
                              }
                            >
                              IVA
                            </span>

                            <span
                              className={`font-medium ${textoPrincipal}`}
                            >
                              {formatearPrecio(
                                obtenerIvaCompra(
                                  compraSeleccionada
                                )
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
                              obtenerTotalCompra(
                                compraSeleccionada
                              )
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
                    onClick={() =>
                      setMostrarFactura(false)
                    }
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
                      descargarFactura(
                        compraSeleccionada
                      )
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