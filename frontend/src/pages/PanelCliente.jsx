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
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Pencil,
  Save,
  Home,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { API_URL } from '../config'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoDark from '../assets/logo-dark.png'

const COMPRAS_KEY = 'cellworld_compras'

function obtenerClaveFavoritos(usuario) {
  if (!usuario) return 'cellworld_favorites'

  return `cellworld_favorites_${
    usuario.id_usuario ||
    usuario.id ||
    'usuario'
  }`
}

function obtenerIdProducto(producto) {
  return (
    producto?.id_producto ??
    producto?.idProducto ??
    producto?.id ??
    producto?.producto_id ??
    null
  )
}

function obtenerNombreProducto(producto) {
  return (
    producto?.nombre_producto ??
    producto?.nombre ??
    producto?.producto ??
    'Producto'
  )
}

function obtenerPrecioProducto(producto) {
  return Number(
    producto?.precio ??
      producto?.precio_unitario ??
      producto?.precio_producto ??
      0
  )
}

function obtenerImagenProducto(producto) {
  return (
    producto?.imagen ??
    producto?.imagen_url ??
    producto?.url_imagen ??
    producto?.foto ??
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
  }
}

function formatearPrecio(valor) {
  return Number(valor || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  const fechaObj = new Date(fecha)

  if (Number.isNaN(fechaObj.getTime())) {
    return 'Sin fecha'
  }

  return fechaObj.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function obtenerProductosCompra(compra) {
  const productos =
    compra?.detalles ??
    compra?.detalle_pedidos ??
    compra?.productos ??
    compra?.items ??
    []

  if (!Array.isArray(productos)) {
    return []
  }

  return productos.map((item) => ({
    ...item,
    nombre:
      item?.nombre ??
      item?.nombre_producto ??
      item?.producto?.nombre ??
      'Producto',
    cantidad: Number(item?.cantidad ?? 1),
    precio: Number(
      item?.precio ??
        item?.precio_unitario ??
        item?.producto?.precio ??
        0
    ),
    imagen:
      item?.imagen ??
      item?.imagen_url ??
      item?.producto?.imagen ??
      '',
  }))
}

function obtenerTotalCompra(compra) {
  if (compra?.total != null) {
    return Number(compra.total)
  }

  if (compra?.total_pedido != null) {
    return Number(compra.total_pedido)
  }

  const productos = obtenerProductosCompra(compra)

  return productos.reduce(
    (total, producto) =>
      total +
      producto.precio *
        producto.cantidad,
    0
  )
}

function obtenerFechaCompra(compra) {
  return (
    compra?.fecha ??
    compra?.creado_en ??
    compra?.fecha_pedido ??
    compra?.created_at ??
    null
  )
}

export default function PanelCliente({
  modoOscuro = false,
  usuario = null,
}) {
  const [usuarioActual, setUsuarioActual] =
    useState(usuario)

  const [seccion, setSeccion] =
    useState('resumen')

  const [favoritos, setFavoritos] =
    useState([])

  const [
    favoritosCargados,
    setFavoritosCargados,
  ] = useState(false)

  const [compras, setCompras] =
    useState([])

  const [
    mostrarDetalles,
    setMostrarDetalles,
  ] = useState(false)

  const [
    compraSeleccionada,
    setCompraSeleccionada,
  ] = useState(null)

  const [
    cargandoCompras,
    setCargandoCompras,
  ] = useState(false)

  const [
    paginaCompras,
    setPaginaCompras,
  ] = useState(1)

  const [
    paginaFavoritos,
    setPaginaFavoritos,
  ] = useState(1)

  // =========================
  // PQR
  // =========================

  const [pqrs, setPqrs] = useState([])

  const [
    cargandoPqrs,
    setCargandoPqrs,
  ] = useState(false)

  const [
    errorPqrs,
    setErrorPqrs,
  ] = useState('')

  const [
    paginaPqrs,
    setPaginaPqrs,
  ] = useState(1)

  // =========================
  // PERFIL
  // =========================

  const [perfil, setPerfil] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
  })

  const [
    perfilOriginal,
    setPerfilOriginal,
  ] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
  })

  const [
    editandoPerfil,
    setEditandoPerfil,
  ] = useState(false)

  const [
    guardandoPerfil,
    setGuardandoPerfil,
  ] = useState(false)

  const [
    mensajePerfil,
    setMensajePerfil,
  ] = useState('')

  const [
    errorPerfil,
    setErrorPerfil,
  ] = useState('')

  // =========================
  // PAGINACIÓN
  // =========================

  const elementosPorPaginaCompras = 3
  const elementosPorPaginaFavoritos = 6
  const elementosPorPaginaPqrs = 4

  const fondoPrincipal = modoOscuro
    ? 'bg-slate-950 text-white'
    : 'bg-gray-100 text-gray-900'

  const fondoTarjeta = modoOscuro
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-gray-200'

  const textoSecundario = modoOscuro
    ? 'text-gray-400'
    : 'text-gray-500'

  // =========================
  // USUARIO
  // =========================

  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const usuarioGuardado =
          localStorage.getItem('usuario')

        if (usuarioGuardado) {
          const usuarioParseado =
            JSON.parse(usuarioGuardado)

          setUsuarioActual(
            usuarioParseado
          )

          const datosPerfil = {
            nombres:
              usuarioParseado?.nombres ||
              '',
            apellidos:
              usuarioParseado?.apellidos ||
              '',
            email:
              usuarioParseado?.email ||
              '',
            telefono:
              usuarioParseado?.telefono ||
              '',
          }

          setPerfil(datosPerfil)
          setPerfilOriginal(datosPerfil)
        } else {
          setUsuarioActual(usuario)

          const datosPerfil = {
            nombres:
              usuario?.nombres || '',
            apellidos:
              usuario?.apellidos || '',
            email:
              usuario?.email || '',
            telefono:
              usuario?.telefono || '',
          }

          setPerfil(datosPerfil)
          setPerfilOriginal(datosPerfil)
        }
      } catch (error) {
        console.error(
          'Error cargando usuario:',
          error
        )
      }
    }

    cargarUsuario()

    window.addEventListener(
      'usuarioCambio',
      cargarUsuario
    )

    window.addEventListener(
      'storage',
      cargarUsuario
    )

    window.addEventListener(
      'focus',
      cargarUsuario
    )

    return () => {
      window.removeEventListener(
        'usuarioCambio',
        cargarUsuario
      )

      window.removeEventListener(
        'storage',
        cargarUsuario
      )

      window.removeEventListener(
        'focus',
        cargarUsuario
      )
    }
  }, [usuario])

  // =========================
  // FAVORITOS
  // =========================

  useEffect(() => {
    const cargarFavoritos = () => {
      try {
        const clave =
          obtenerClaveFavoritos(
            usuarioActual
          )

        const favoritosGuardados =
          localStorage.getItem(clave)

        if (favoritosGuardados) {
          const datos = JSON.parse(
            favoritosGuardados
          )

          setFavoritos(
            Array.isArray(datos)
              ? datos.map(
                  normalizarProducto
                )
              : []
          )
        } else {
          setFavoritos([])
        }
      } catch (error) {
        console.error(
          'Error cargando favoritos:',
          error
        )

        setFavoritos([])
      }

      setFavoritosCargados(true)
    }

    cargarFavoritos()

    window.addEventListener(
      'favoritosActualizados',
      cargarFavoritos
    )

    window.addEventListener(
      'usuarioCambio',
      cargarFavoritos
    )

    return () => {
      window.removeEventListener(
        'favoritosActualizados',
        cargarFavoritos
      )

      window.removeEventListener(
        'usuarioCambio',
        cargarFavoritos
      )
    }
  }, [usuarioActual])

  useEffect(() => {
    if (!favoritosCargados) return

    try {
      const clave =
        obtenerClaveFavoritos(
          usuarioActual
        )

      localStorage.setItem(
        clave,
        JSON.stringify(favoritos)
      )
    } catch (error) {
      console.error(
        'Error guardando favoritos:',
        error
      )
    }
  }, [
    favoritos,
    favoritosCargados,
    usuarioActual,
  ])

  const quitarFavorito = (
    idProducto
  ) => {
    setFavoritos((actuales) =>
      actuales.filter(
        (producto) =>
          obtenerIdProducto(
            producto
          ) !== idProducto
      )
    )

    window.dispatchEvent(
      new Event('favoritosActualizados')
    )
  }

  // =========================
  // COMPRAS
  // =========================

  async function cargarCompras() {
    setCargandoCompras(true)

    const token =
      localStorage.getItem('token')

    if (!token) {
      try {
        const comprasLocales =
          JSON.parse(
            localStorage.getItem(
              COMPRAS_KEY
            ) || '[]'
          )

        setCompras(
          Array.isArray(
            comprasLocales
          )
            ? comprasLocales
            : []
        )
      } catch {
        setCompras([])
      }

      setCargandoCompras(false)
      return
    }

    try {
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

      if (!respuesta.ok) {
        throw new Error(
          'No se pudieron cargar las compras.'
        )
      }

      const data =
        await respuesta.json()

      setCompras(
        Array.isArray(data)
          ? data
          : data?.pedidos || []
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
          Array.isArray(
            comprasLocales
          )
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

  useEffect(() => {
    cargarCompras()
  }, [])

  useEffect(() => {
    if (seccion === 'compras') {
      cargarCompras()
    }
  }, [seccion])

  // =========================
  // PQR
  // =========================

  async function cargarPqrs() {
    setCargandoPqrs(true)
    setErrorPqrs('')

    const token =
      localStorage.getItem('token')

    if (!token) {
      setPqrs([])
      setErrorPqrs(
        'Debes iniciar sesión para consultar tus PQR.'
      )
      setCargandoPqrs(false)
      return
    }

    try {
      const respuesta = await fetch(
        `${API_URL}/api/pqr/mis-pqrs`,
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
        await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          data?.detail ||
            'No se pudieron cargar tus PQR.'
        )
      }

      setPqrs(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Error cargando PQR:',
        error
      )

      setPqrs([])

      setErrorPqrs(
        error?.message ||
          'No se pudieron cargar tus PQR.'
      )
    } finally {
      setCargandoPqrs(false)
    }
  }

  useEffect(() => {
    if (seccion === 'pqrs') {
      cargarPqrs()
    }
  }, [seccion])

  // =========================
  // PAGINACIÓN
  // =========================

  const totalPaginasCompras =
    Math.max(
      1,
      Math.ceil(
        compras.length /
          elementosPorPaginaCompras
      )
    )

  const comprasPaginaActual =
    compras.slice(
      (paginaCompras - 1) *
        elementosPorPaginaCompras,
      paginaCompras *
        elementosPorPaginaCompras
    )

  const totalPaginasFavoritos =
    Math.max(
      1,
      Math.ceil(
        favoritos.length /
          elementosPorPaginaFavoritos
      )
    )

  const favoritosPaginaActual =
    favoritos.slice(
      (paginaFavoritos - 1) *
        elementosPorPaginaFavoritos,
      paginaFavoritos *
        elementosPorPaginaFavoritos
    )

  const totalPqrs = pqrs.length

  const totalPaginasPqrs =
    Math.max(
      1,
      Math.ceil(
        totalPqrs /
          elementosPorPaginaPqrs
      )
    )

  const pqrsPaginaActual =
    pqrs.slice(
      (paginaPqrs - 1) *
        elementosPorPaginaPqrs,
      paginaPqrs *
        elementosPorPaginaPqrs
    )

  useEffect(() => {
    if (
      paginaCompras >
      totalPaginasCompras
    ) {
      setPaginaCompras(
        totalPaginasCompras
      )
    }
  }, [
    paginaCompras,
    totalPaginasCompras,
  ])

  useEffect(() => {
    if (
      paginaFavoritos >
      totalPaginasFavoritos
    ) {
      setPaginaFavoritos(
        totalPaginasFavoritos
      )
    }
  }, [
    paginaFavoritos,
    totalPaginasFavoritos,
  ])

  useEffect(() => {
    if (
      paginaPqrs >
      totalPaginasPqrs
    ) {
      setPaginaPqrs(
        totalPaginasPqrs
      )
    }
  }, [
    paginaPqrs,
    totalPaginasPqrs,
  ])

  // =========================
  // EDITAR PERFIL
  // =========================

  const comenzarEdicionPerfil = () => {
    setMensajePerfil('')
    setErrorPerfil('')

    setPerfilOriginal({
      ...perfil,
    })

    setEditandoPerfil(true)
  }

  const cancelarEdicionPerfil = () => {
    setPerfil({
      ...perfilOriginal,
    })

    setMensajePerfil('')
    setErrorPerfil('')
    setEditandoPerfil(false)
  }

  const manejarCambioPerfil = (
    campo,
    valor
  ) => {
    setPerfil((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const guardarPerfil = async () => {
    setMensajePerfil('')
    setErrorPerfil('')

    const token =
      localStorage.getItem('token')

    if (!token) {
      setErrorPerfil(
        'Debes iniciar sesión para editar tu perfil.'
      )
      return
    }

    if (
      !perfil.nombres.trim() ||
      !perfil.apellidos.trim() ||
      !perfil.email.trim()
    ) {
      setErrorPerfil(
        'Nombres, apellidos y correo son obligatorios.'
      )
      return
    }

    setGuardandoPerfil(true)

    try {
      const respuesta = await fetch(
        `${API_URL}/api/usuarios/perfil`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            nombres:
              perfil.nombres.trim(),
            apellidos:
              perfil.apellidos.trim(),
            email:
              perfil.email.trim(),
            telefono:
              perfil.telefono.trim(),
          }),
        }
      )

      const data =
        await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          data?.detail ||
            'No se pudo actualizar el perfil.'
        )
      }

      const usuarioActualizado =
        data?.usuario || {
          ...usuarioActual,
          ...perfil,
        }

      localStorage.setItem(
        'usuario',
        JSON.stringify(
          usuarioActualizado
        )
      )

      setUsuarioActual(
        usuarioActualizado
      )

      const datosActualizados = {
        nombres:
          usuarioActualizado?.nombres ||
          '',
        apellidos:
          usuarioActualizado?.apellidos ||
          '',
        email:
          usuarioActualizado?.email ||
          '',
        telefono:
          usuarioActualizado?.telefono ||
          '',
      }

      setPerfil(
        datosActualizados
      )

      setPerfilOriginal(
        datosActualizados
      )

      setEditandoPerfil(false)

      setMensajePerfil(
        'Perfil actualizado correctamente.'
      )

      window.dispatchEvent(
        new Event('usuarioCambio')
      )
    } catch (error) {
      console.error(
        'Error actualizando perfil:',
        error
      )

      setErrorPerfil(
        error?.message ||
          'No se pudo actualizar el perfil.'
      )
    } finally {
      setGuardandoPerfil(false)
    }
  }

  // =========================
  // ESCAPE
  // =========================

  useEffect(() => {
    const cerrarConEscape = (
      event
    ) => {
      if (event.key === 'Escape') {
        setMostrarDetalles(false)
      }
    }

    window.addEventListener(
      'keydown',
      cerrarConEscape
    )

    return () => {
      window.removeEventListener(
        'keydown',
        cerrarConEscape
      )
    }
  }, [])

  // =========================
  // FACTURA
  // =========================

  const generarFacturaPDF = (
    compra
  ) => {
    const doc = new jsPDF()

    const productos =
      obtenerProductosCompra(
        compra
      )

    const total =
      obtenerTotalCompra(compra)

    const idPedido =
      compra?.id_pedido ??
      compra?.id ??
      'N/A'

    doc.addImage(
      logoDark,
      'PNG',
      15,
      10,
      45,
      15
    )

    doc.setFontSize(18)

    doc.text(
      'Factura de compra',
      15,
      40
    )

    doc.setFontSize(11)

    doc.text(
      `Pedido #${idPedido}`,
      15,
      50
    )

    doc.text(
      `Fecha: ${formatearFecha(
        obtenerFechaCompra(
          compra
        )
      )}`,
      15,
      58
    )

    doc.text(
      `Cliente: ${
        usuarioActual?.nombres ||
        ''
      } ${
        usuarioActual?.apellidos ||
        ''
      }`,
      15,
      66
    )

    const filas =
      productos.map((producto) => [
        producto.nombre,
        producto.cantidad,
        formatearPrecio(
          producto.precio
        ),
        formatearPrecio(
          producto.precio *
            producto.cantidad
        ),
      ])

    autoTable(doc, {
      startY: 75,
      head: [
        [
          'Producto',
          'Cantidad',
          'Precio',
          'Subtotal',
        ],
      ],
      body: filas,
    })

    const posicionFinal =
      doc.lastAutoTable?.finalY ||
      90

    doc.setFontSize(13)

    doc.text(
      `Total: ${formatearPrecio(
        total
      )}`,
      15,
      posicionFinal + 15
    )

    doc.save(
      `factura-cellworld-${idPedido}.pdf`
    )
  }

  return (
    <div
      className={`h-screen overflow-hidden ${fondoPrincipal}`}
    >
      {/* ========================= */}
      {/* MENÚ LATERAL */}
      {/* ========================= */}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-[245px] border-r ${
          modoOscuro
            ? 'border-slate-800 bg-slate-900'
            : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <ShoppingBag
                size={21}
                className="text-white"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                CellWorld
              </h2>

              <p
                className={`text-xs ${textoSecundario}`}
              >
                Panel cliente
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {/* VOLVER AL INICIO */}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/'
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${textoSecundario} hover:bg-blue-500/10`}
            >
              <Home size={19} />
              <span>Volver al inicio</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setSeccion('resumen')
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                seccion === 'resumen'
                  ? 'bg-blue-600 text-white'
                  : textoSecundario
              }`}
            >
              <LayoutDashboard
                size={19}
              />
              <span>Resumen</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setSeccion('compras')
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                seccion === 'compras'
                  ? 'bg-blue-600 text-white'
                  : textoSecundario
              }`}
            >
              <ShoppingBag
                size={19}
              />
              <span>Mis compras</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setSeccion('pqrs')
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                seccion === 'pqrs'
                  ? 'bg-blue-600 text-white'
                  : textoSecundario
              }`}
            >
              <MessageSquare
                size={19}
              />

              <span>Mis PQR</span>

              {totalPqrs > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                    seccion === 'pqrs'
                      ? 'bg-white/20 text-white'
                      : modoOscuro
                        ? 'bg-slate-800 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {totalPqrs}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setSeccion(
                  'seleccionados'
                )
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                seccion ===
                'seleccionados'
                  ? 'bg-blue-600 text-white'
                  : textoSecundario
              }`}
            >
              <Heart size={19} />

              <span>
                Mis seleccionados
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setSeccion('perfil')
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                seccion === 'perfil'
                  ? 'bg-blue-600 text-white'
                  : textoSecundario
              }`}
            >
              <User size={19} />
              <span>Mi perfil</span>
            </button>
          </nav>

          <div className="mt-auto">
            <div
              className={`rounded-xl border p-3 ${
                modoOscuro
                  ? 'border-slate-800 bg-slate-950'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <p className="truncate text-sm font-semibold">
                {usuarioActual?.nombres ||
                  'Cliente'}
              </p>

              <p
                className={`truncate text-xs ${textoSecundario}`}
              >
                {usuarioActual?.email ||
                  ''}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================= */}
      {/* CONTENIDO */}
      {/* ========================= */}

      <main className="ml-[245px] flex h-screen flex-col overflow-hidden">
        <header
          className={`flex h-[78px] shrink-0 items-center border-b px-8 ${
            modoOscuro
              ? 'border-slate-800 bg-slate-950'
              : 'border-gray-200 bg-gray-100'
          }`}
        >
          <div>
            <h1 className="text-2xl font-bold">
              {seccion === 'resumen' &&
                'Resumen'}

              {seccion === 'compras' &&
                'Mis compras'}

              {seccion === 'pqrs' &&
                'Mis PQR'}

              {seccion ===
                'seleccionados' &&
                'Mis seleccionados'}

              {seccion === 'perfil' &&
                'Mi perfil'}
            </h1>

            <p
              className={`mt-1 text-sm ${textoSecundario}`}
            >
              {seccion === 'resumen' &&
                'Consulta el estado de tu cuenta.'}

              {seccion === 'compras' &&
                'Consulta todas tus compras realizadas.'}

              {seccion === 'pqrs' &&
                'Consulta tus solicitudes, preguntas, quejas y reclamos.'}

              {seccion ===
                'seleccionados' &&
                'Productos que has guardado.'}

              {seccion === 'perfil' &&
                'Consulta y edita la información de tu cuenta.'}
            </p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden p-8">
          {/* ========================= */}
          {/* RESUMEN */}
          {/* ========================= */}

          {seccion === 'resumen' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div
                  className={`rounded-2xl border p-5 ${fondoTarjeta}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm ${textoSecundario}`}
                      >
                        Compras
                      </p>

                      <p className="mt-1 text-3xl font-bold">
                        {compras.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-500/10 p-3">
                      <ShoppingBag
                        className="text-blue-500"
                        size={22}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${fondoTarjeta}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm ${textoSecundario}`}
                      >
                        Seleccionados
                      </p>

                      <p className="mt-1 text-3xl font-bold">
                        {favoritos.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-red-500/10 p-3">
                      <Heart
                        className="text-red-500"
                        size={22}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${fondoTarjeta}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm ${textoSecundario}`}
                      >
                        PQR
                      </p>

                      <p className="mt-1 text-3xl font-bold">
                        {totalPqrs}
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-500/10 p-3">
                      <MessageSquare
                        className="text-blue-500"
                        size={22}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-6 ${fondoTarjeta}`}
              >
                <h2 className="text-lg font-bold">
                  Bienvenido a CellWorld
                </h2>

                <p
                  className={`mt-2 text-sm ${textoSecundario}`}
                >
                  Desde este panel puedes consultar
                  tus compras, productos seleccionados,
                  PQR y la información de tu perfil.
                </p>
              </div>
            </div>
          )}

          {/* ========================= */}
          {/* COMPRAS */}
          {/* ========================= */}

          {seccion === 'compras' && (
            <div className="space-y-5">
              {cargandoCompras ? (
                <div
                  className={`rounded-2xl border p-10 text-center ${fondoTarjeta}`}
                >
                  <p
                    className={
                      textoSecundario
                    }
                  >
                    Cargando compras...
                  </p>
                </div>
              ) : compras.length === 0 ? (
                <div
                  className={`rounded-2xl border p-10 text-center ${fondoTarjeta}`}
                >
                  <ShoppingBag
                    size={42}
                    className="mx-auto mb-3 opacity-50"
                  />

                  <p className="font-semibold">
                    Aún no tienes compras
                  </p>

                  <p
                    className={`mt-1 text-sm ${textoSecundario}`}
                  >
                    Cuando realices una compra
                    aparecerá aquí.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {comprasPaginaActual.map(
                      (compra, index) => {
                        const productos =
                          obtenerProductosCompra(
                            compra
                          )

                        const total =
                          obtenerTotalCompra(
                            compra
                          )

                        const idPedido =
                          compra?.id_pedido ??
                          compra?.id ??
                          index

                        return (
                          <div
                            key={idPedido}
                            className={`rounded-2xl border p-5 ${fondoTarjeta}`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-blue-500/10 p-3">
                                  <Package
                                    size={24}
                                    className="text-blue-500"
                                  />
                                </div>

                                <div>
                                  <h3 className="font-bold">
                                    Pedido #
                                    {idPedido}
                                  </h3>

                                  <div
                                    className={`mt-1 flex flex-wrap gap-4 text-sm ${textoSecundario}`}
                                  >
                                    <span className="flex items-center gap-1">
                                      <CalendarDays
                                        size={15}
                                      />

                                      {formatearFecha(
                                        obtenerFechaCompra(
                                          compra
                                        )
                                      )}
                                    </span>

                                    <span className="flex items-center gap-1">
                                      <CreditCard
                                        size={15}
                                      />

                                      {formatearPrecio(
                                        total
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setCompraSeleccionada(
                                    compra
                                  )

                                  setMostrarDetalles(
                                    true
                                  )
                                }}
                                className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                              >
                                <Eye
                                  size={17}
                                />

                                Ver detalles
                              </button>
                            </div>

                            {productos.length >
                              0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {productos
                                  .slice(
                                    0,
                                    4
                                  )
                                  .map(
                                    (
                                      producto,
                                      productoIndex
                                    ) => (
                                      <span
                                        key={`${idPedido}-${productoIndex}`}
                                        className={`rounded-lg px-3 py-1.5 text-xs ${
                                          modoOscuro
                                            ? 'bg-slate-800 text-gray-300'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}
                                      >
                                        {
                                          producto.nombre
                                        }{' '}
                                        x
                                        {
                                          producto.cantidad
                                        }
                                      </span>
                                    )
                                  )}
                              </div>
                            )}
                          </div>
                        )
                      }
                    )}
                  </div>

                  {totalPaginasCompras >
                    1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={
                          paginaCompras ===
                          1
                        }
                        onClick={() =>
                          setPaginaCompras(
                            (pagina) =>
                              Math.max(
                                1,
                                pagina - 1
                              )
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
                          paginaCompras ===
                          1
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        <ChevronLeft
                          size={17}
                        />

                        Anterior
                      </button>

                      <span
                        className={`text-sm ${textoSecundario}`}
                      >
                        Página{' '}
                        {paginaCompras}{' '}
                        de{' '}
                        {totalPaginasCompras}
                      </span>

                      <button
                        type="button"
                        disabled={
                          paginaCompras ===
                          totalPaginasCompras
                        }
                        onClick={() =>
                          setPaginaCompras(
                            (pagina) =>
                              Math.min(
                                totalPaginasCompras,
                                pagina + 1
                              )
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
                          paginaCompras ===
                          totalPaginasCompras
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        Siguiente

                        <ChevronRight
                          size={17}
                        />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========================= */}
          {/* PQR */}
          {/* ========================= */}

          {seccion === 'pqrs' && (
            <div className="space-y-4">
              <div
                className={`rounded-2xl border p-4 ${fondoTarjeta}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">
                      Mis PQR
                    </h2>

                    <p
                      className={`mt-1 text-sm ${textoSecundario}`}
                    >
                      Consulta las PQR que has realizado
                      y sus respuestas.
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-500/10 p-3">
                    <MessageSquare
                      size={24}
                      className="text-blue-500"
                    />
                  </div>
                </div>
              </div>

              {cargandoPqrs ? (
                <div
                  className={`rounded-2xl border p-10 text-center ${fondoTarjeta}`}
                >
                  <MessageSquare
                    size={40}
                    className="mx-auto mb-3 opacity-50"
                  />

                  <p
                    className={`text-sm ${textoSecundario}`}
                  >
                    Cargando tus PQR...
                  </p>
                </div>
              ) : errorPqrs ? (
                <div
                  className={`rounded-2xl border p-8 text-center ${fondoTarjeta}`}
                >
                  <p className="font-semibold text-red-500">
                    {errorPqrs}
                  </p>

                  <button
                    type="button"
                    onClick={cargarPqrs}
                    className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Intentar nuevamente
                  </button>
                </div>
              ) : pqrs.length === 0 ? (
                <div
                  className={`rounded-2xl border p-10 text-center ${fondoTarjeta}`}
                >
                  <MessageSquare
                    size={42}
                    className="mx-auto mb-3 opacity-40"
                  />

                  <p className="font-semibold">
                    No tienes PQR realizadas
                  </p>

                  <p
                    className={`mt-1 text-sm ${textoSecundario}`}
                  >
                    Cuando realices una PQR aparecerá
                    aquí.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {pqrsPaginaActual.map(
                      (pqr) => (
                        <div
                          key={pqr.id_pqr}
                          className={`rounded-2xl border p-4 ${fondoTarjeta}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                                <MessageSquare
                                  size={18}
                                  className="text-blue-500"
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold">
                                  PQR #
                                  {
                                    pqr.id_pqr
                                  }
                                </p>

                                <p
                                  className={`text-xs ${textoSecundario}`}
                                >
                                  {formatearFecha(
                                    pqr.creado_en
                                  )}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                String(
                                  pqr.estado ||
                                    ''
                                ).toLowerCase() ===
                                'respondida'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-yellow-500/10 text-yellow-500'
                              }`}
                            >
                              {pqr.estado ||
                                'Pendiente'}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                              <p
                                className={`text-xs ${textoSecundario}`}
                              >
                                Tipo
                              </p>

                              <p className="mt-0.5 truncate text-sm font-semibold">
                                {pqr.tipo}
                              </p>
                            </div>

                            <div>
                              <p
                                className={`text-xs ${textoSecundario}`}
                              >
                                Estado
                              </p>

                              <p className="mt-0.5 truncate text-sm font-semibold">
                                {pqr.estado}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p
                              className={`text-xs ${textoSecundario}`}
                            >
                              Asunto
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold">
                              {pqr.asunto}
                            </p>
                          </div>

                          <div className="mt-3">
                            <p
                              className={`text-xs ${textoSecundario}`}
                            >
                              Descripción
                            </p>

                            <p className="mt-1 text-sm">
                              {pqr.descripcion}
                            </p>
                          </div>

                          <div
                            className={`mt-3 rounded-xl border p-3 ${
                              modoOscuro
                                ? 'border-slate-800 bg-slate-950'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <p className="text-xs font-bold">
                              Respuesta
                            </p>

                            {pqr.respuesta ? (
                              <p className="mt-1 text-sm">
                                {pqr.respuesta}
                              </p>
                            ) : (
                              <p
                                className={`mt-1 text-sm ${textoSecundario}`}
                              >
                                Tu PQR está pendiente
                                de respuesta.
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {totalPaginasPqrs >
                    1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={
                          paginaPqrs ===
                          1
                        }
                        onClick={() =>
                          setPaginaPqrs(
                            (pagina) =>
                              Math.max(
                                1,
                                pagina - 1
                              )
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
                          paginaPqrs === 1
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        <ChevronLeft
                          size={17}
                        />

                        Anterior
                      </button>

                      <span
                        className={`text-sm ${textoSecundario}`}
                      >
                        Página{' '}
                        {paginaPqrs}{' '}
                        de{' '}
                        {totalPaginasPqrs}
                      </span>

                      <button
                        type="button"
                        disabled={
                          paginaPqrs ===
                          totalPaginasPqrs
                        }
                        onClick={() =>
                          setPaginaPqrs(
                            (pagina) =>
                              Math.min(
                                totalPaginasPqrs,
                                pagina + 1
                              )
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
                          paginaPqrs ===
                          totalPaginasPqrs
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        Siguiente

                        <ChevronRight
                          size={17}
                        />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========================= */}
          {/* SELECCIONADOS */}
          {/* ========================= */}

          {seccion ===
            'seleccionados' && (
            <div className="space-y-5">
              {favoritos.length === 0 ? (
                <div
                  className={`rounded-2xl border p-10 text-center ${fondoTarjeta}`}
                >
                  <Heart
                    size={42}
                    className="mx-auto mb-3 opacity-40"
                  />

                  <p className="font-semibold">
                    No tienes productos seleccionados
                  </p>

                  <p
                    className={`mt-1 text-sm ${textoSecundario}`}
                  >
                    Los productos que marques como
                    favoritos aparecerán aquí.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {favoritosPaginaActual.map(
                      (producto) => (
                        <div
                          key={obtenerIdProducto(
                            producto
                          )}
                          className={`overflow-hidden rounded-2xl border ${fondoTarjeta}`}
                        >
                          <div
                            className={`flex h-44 items-center justify-center ${
                              modoOscuro
                                ? 'bg-slate-950'
                                : 'bg-gray-50'
                            }`}
                          >
                            {obtenerImagenProducto(
                              producto
                            ) ? (
                              <img
                                src={obtenerImagenProducto(
                                  producto
                                )}
                                alt={obtenerNombreProducto(
                                  producto
                                )}
                                className="h-full w-full object-contain p-5"
                              />
                            ) : (
                              <Package
                                size={45}
                                className="opacity-30"
                              />
                            )}
                          </div>

                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold">
                                  {obtenerNombreProducto(
                                    producto
                                  )}
                                </h3>

                                <p className="mt-1 font-bold text-blue-500">
                                  {formatearPrecio(
                                    obtenerPrecioProducto(
                                      producto
                                    )
                                  )}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  quitarFavorito(
                                    obtenerIdProducto(
                                      producto
                                    )
                                  )
                                }
                                className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2
                                  size={18}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {totalPaginasFavoritos >
                    1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={
                          paginaFavoritos ===
                          1
                        }
                        onClick={() =>
                          setPaginaFavoritos(
                            (pagina) =>
                              Math.max(
                                1,
                                pagina - 1
                              )
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
                          paginaFavoritos ===
                          1
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        <ChevronLeft
                          size={17}
                        />

                        Anterior
                      </button>

                      <span
                        className={`text-sm ${textoSecundario}`}
                      >
                        Página{' '}
                        {
                          paginaFavoritos
                        }{' '}
                        de{' '}
                        {
                          totalPaginasFavoritos
                        }
                      </span>

                      <button
                        type="button"
                        disabled={
                          paginaFavoritos ===
                          totalPaginasFavoritos
                        }
                        onClick={() =>
                          setPaginaFavoritos(
                            (pagina) =>
                              Math.min(
                                totalPaginasFavoritos,
                                pagina + 1
                              )
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
                          paginaFavoritos ===
                          totalPaginasFavoritos
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        Siguiente

                        <ChevronRight
                          size={17}
                        />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========================= */}
          {/* MI PERFIL */}
          {/* ========================= */}

          {seccion === 'perfil' && (
            <div
              className={`rounded-2xl border p-6 ${fondoTarjeta}`}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
                    <User
                      size={27}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Información personal
                    </h2>

                    <p
                      className={`text-sm ${textoSecundario}`}
                    >
                      Consulta y edita los datos de tu
                      cuenta.
                    </p>
                  </div>
                </div>

                {!editandoPerfil && (
                  <button
                    type="button"
                    onClick={
                      comenzarEdicionPerfil
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Pencil
                      size={17}
                    />
                    Editar perfil
                  </button>
                )}
              </div>

              {mensajePerfil && (
                <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                  {mensajePerfil}
                </div>
              )}

              {errorPerfil && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {errorPerfil}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${textoSecundario}`}
                  >
                    Nombres
                  </label>

                  <input
                    type="text"
                    value={perfil.nombres}
                    disabled={
                      !editandoPerfil
                    }
                    onChange={(event) =>
                      manejarCambioPerfil(
                        'nombres',
                        event.target.value
                      )
                    }
                    className={`w-full rounded-xl border px-4 py-3 outline-none ${
                      modoOscuro
                        ? 'border-slate-700 bg-slate-950 disabled:bg-slate-900'
                        : 'border-gray-200 bg-gray-50 disabled:bg-gray-100'
                    } ${
                      editandoPerfil
                        ? 'focus:border-blue-500'
                        : ''
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${textoSecundario}`}
                  >
                    Apellidos
                  </label>

                  <input
                    type="text"
                    value={perfil.apellidos}
                    disabled={
                      !editandoPerfil
                    }
                    onChange={(event) =>
                      manejarCambioPerfil(
                        'apellidos',
                        event.target.value
                      )
                    }
                    className={`w-full rounded-xl border px-4 py-3 outline-none ${
                      modoOscuro
                        ? 'border-slate-700 bg-slate-950 disabled:bg-slate-900'
                        : 'border-gray-200 bg-gray-50 disabled:bg-gray-100'
                    } ${
                      editandoPerfil
                        ? 'focus:border-blue-500'
                        : ''
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${textoSecundario}`}
                  >
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    value={perfil.email}
                    disabled={
                      !editandoPerfil
                    }
                    onChange={(event) =>
                      manejarCambioPerfil(
                        'email',
                        event.target.value
                      )
                    }
                    className={`w-full rounded-xl border px-4 py-3 outline-none ${
                      modoOscuro
                        ? 'border-slate-700 bg-slate-950 disabled:bg-slate-900'
                        : 'border-gray-200 bg-gray-50 disabled:bg-gray-100'
                    } ${
                      editandoPerfil
                        ? 'focus:border-blue-500'
                        : ''
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${textoSecundario}`}
                  >
                    Teléfono
                  </label>

                  <input
                    type="text"
                    value={perfil.telefono}
                    disabled={
                      !editandoPerfil
                    }
                    onChange={(event) =>
                      manejarCambioPerfil(
                        'telefono',
                        event.target.value
                      )
                    }
                    className={`w-full rounded-xl border px-4 py-3 outline-none ${
                      modoOscuro
                        ? 'border-slate-700 bg-slate-950 disabled:bg-slate-900'
                        : 'border-gray-200 bg-gray-50 disabled:bg-gray-100'
                    } ${
                      editandoPerfil
                        ? 'focus:border-blue-500'
                        : ''
                    }`}
                  />
                </div>
              </div>

              {editandoPerfil && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={
                      cancelarEdicionPerfil
                    }
                    disabled={
                      guardandoPerfil
                    }
                    className={`rounded-xl border px-5 py-2.5 text-sm font-medium ${
                      modoOscuro
                        ? 'border-slate-700 hover:bg-slate-800'
                        : 'border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={guardarPerfil}
                    disabled={
                      guardandoPerfil
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={17} />

                    {guardandoPerfil
                      ? 'Guardando...'
                      : 'Guardar cambios'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ========================= */}
      {/* MODAL COMPRA */}
      {/* ========================= */}

      {mostrarDetalles &&
        compraSeleccionada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setMostrarDetalles(false)
              }
            }}
          >
            <div
              className={`w-full max-w-2xl rounded-2xl border ${fondoTarjeta}`}
            >
              <div className="flex items-center justify-between border-b p-5">
                <div>
                  <h2 className="text-lg font-bold">
                    Detalles del pedido #
                    {compraSeleccionada?.id_pedido ??
                      compraSeleccionada?.id}
                  </h2>

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
                  onClick={() =>
                    setMostrarDetalles(
                      false
                    )
                  }
                  className={`rounded-xl p-2 ${textoSecundario} hover:bg-gray-500/10`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-5">
                <div className="space-y-3">
                  {obtenerProductosCompra(
                    compraSeleccionada
                  ).map(
                    (
                      producto,
                      index
                    ) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                          modoOscuro
                            ? 'border-slate-800 bg-slate-950'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white">
                            {producto.imagen ? (
                              <img
                                src={
                                  producto.imagen
                                }
                                alt={
                                  producto.nombre
                                }
                                className="h-full w-full rounded-lg object-contain"
                              />
                            ) : (
                              <Package
                                size={22}
                                className="text-gray-400"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {
                                producto.nombre
                              }
                            </p>

                            <p
                              className={`text-sm ${textoSecundario}`}
                            >
                              Cantidad:{' '}
                              {
                                producto.cantidad
                              }
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 font-semibold">
                          {formatearPrecio(
                            producto.precio *
                              producto.cantidad
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-5">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-xl font-bold text-blue-500">
                    {formatearPrecio(
                      obtenerTotalCompra(
                        compraSeleccionada
                      )
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t p-5">
                <button
                  type="button"
                  onClick={() =>
                    generarFacturaPDF(
                      compraSeleccionada
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Download
                    size={17}
                  />
                  Descargar factura
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarDetalles(
                      false
                    )
                  }
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
                    modoOscuro
                      ? 'border-slate-700 hover:bg-slate-800'
                      : 'border-gray-200 hover:bg-gray-100'
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