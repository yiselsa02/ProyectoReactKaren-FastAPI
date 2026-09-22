import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  User,
  Mail,
  ShoppingBag,
  CalendarDays,
  RefreshCw,
  Users,
  Boxes,
  DollarSign,
  Search,
  Plus,
} from 'lucide-react'

import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'
import EmployeeProductForm from '../components/EmployeeProductForm'
import { API_URL } from '../config'

function PanelEmpleado({ modoOscuro }) {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState(null)
  const [vista, setVista] = useState('resumen')
  const [cargando, setCargando] = useState(true)

  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    totalClientes: 0,
  })

  const [ventas, setVentas] = useState([])
  const [reporte, setReporte] = useState(null)

  const [cargandoVentas, setCargandoVentas] = useState(false)
  const [cargandoReporte, setCargandoReporte] = useState(false)

  const [errorVentas, setErrorVentas] = useState('')
  const [errorReporte, setErrorReporte] = useState('')

  const [paginaVentas, setPaginaVentas] = useState(1)
  const [paginaReporte, setPaginaReporte] = useState(1)

  const [fechaReporte, setFechaReporte] = useState(() => {
    const hoy = new Date()
    const año = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')

    return `${año}-${mes}-${dia}`
  })

  const elementosPorPagina = 5

  // =========================================================
  // ESTILOS
  // =========================================================

  const fondo = modoOscuro
    ? 'bg-[#08111f] text-white'
    : 'bg-slate-50 text-slate-900'

  const tarjeta = modoOscuro
    ? 'bg-[#0d1929] border-slate-700'
    : 'bg-white border-slate-200'

  const secundario = modoOscuro
    ? 'text-slate-400'
    : 'text-slate-500'

  const fila = modoOscuro
    ? 'border-slate-700 hover:bg-slate-800/60'
    : 'border-slate-100 hover:bg-slate-50'

  const fondoTabla = modoOscuro
    ? 'bg-[#0d1929]'
    : 'bg-white'

  const encabezadoTabla = modoOscuro
    ? 'bg-[#17263c] text-slate-200'
    : 'bg-slate-50 text-slate-700'

  const botonSecundario = modoOscuro
    ? 'border-slate-700 bg-[#0d1929] text-slate-200 hover:bg-slate-800'
    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'

  const etiquetaNeutral = modoOscuro
    ? 'bg-slate-800 text-slate-200'
    : 'bg-slate-100 text-slate-600'

  // =========================================================
  // DATOS GENERALES
  // =========================================================

  const cargarDatos = async (token) => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      setCargando(true)

      const [productosResponse, clientesResponse] =
        await Promise.all([
          fetch('${API_URL}/api/productos', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(
            '${API_URL}/api/usuarios/estadisticas',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ])

      if (
        productosResponse.status === 401 ||
        productosResponse.status === 403 ||
        clientesResponse.status === 401 ||
        clientesResponse.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        navigate('/login')
        return
      }

      const productos = await productosResponse.json()
      const clientes = await clientesResponse.json()

      const listaProductos = Array.isArray(productos)
        ? productos
        : Array.isArray(productos.productos)
          ? productos.productos
          : []

      setEstadisticas({
        totalProductos: listaProductos.length,
        totalClientes:
          Number(clientes.total_clientes) || 0,
      })
    } catch (error) {
      console.error(
        'ERROR CARGANDO DATOS DEL EMPLEADO:',
        error
      )
    } finally {
      setCargando(false)
    }
  }

  // =========================================================
  // USUARIO ACTUAL
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')

    if (!token || !usuarioGuardado) {
      navigate('/login')
      return
    }

    try {
      const actual = JSON.parse(usuarioGuardado)

      if (Number(actual.rol_id) !== 3) {
        navigate('/')
        return
      }

      setUsuario(actual)
      cargarDatos(token)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      navigate('/login')
    }
  }, [navigate])

  // =========================================================
  // VENTAS
  // =========================================================

  const cargarVentas = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setCargandoVentas(true)
      setErrorVentas('')

      const respuesta = await fetch(
        '${API_URL}/api/pedidos/historial',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (
        respuesta.status === 401 ||
        respuesta.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        navigate('/login')
        return
      }

      const data = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          data.detail ||
            'No se pudo cargar el historial de ventas'
        )
      }

      setVentas(
        Array.isArray(data.ventas)
          ? data.ventas
          : []
      )

      setPaginaVentas(1)
    } catch (error) {
      setErrorVentas(error.message)
    } finally {
      setCargandoVentas(false)
    }
  }

  // =========================================================
  // REPORTE DIARIO
  // =========================================================

  const cargarReporte = async (
    fecha = fechaReporte
  ) => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    if (!fecha) {
      setErrorReporte(
        'Selecciona una fecha para consultar el reporte.'
      )
      return
    }

    try {
      setCargandoReporte(true)
      setErrorReporte('')

      const respuesta = await fetch(
        `${API_URL}/api/pedidos/reporte-diario?fecha=${encodeURIComponent(
          fecha
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (
        respuesta.status === 401 ||
        respuesta.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        navigate('/login')
        return
      }

      const data = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          data.detail ||
            'No se pudo generar el reporte diario'
        )
      }

      setReporte(data)
      setPaginaReporte(1)
    } catch (error) {
      setErrorReporte(error.message)
      setReporte(null)
    } finally {
      setCargandoReporte(false)
    }
  }

  // =========================================================
  // CARGAR SEGÚN VISTA
  // =========================================================

  useEffect(() => {
    if (vista === 'historial') {
      cargarVentas()
    }

    if (vista === 'reporte') {
      cargarReporte()
    }
  }, [vista])

  // =========================================================
  // FORMATEADORES
  // =========================================================

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'

    const fechaObj = new Date(fecha)

    if (Number.isNaN(fechaObj.getTime())) {
      return fecha
    }

    return fechaObj.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatearFechaCorta = (fecha) => {
    if (!fecha) return 'Sin fecha'

    const fechaObj = new Date(
      `${fecha}T00:00:00`
    )

    if (Number.isNaN(fechaObj.getTime())) {
      return fecha
    }

    return fechaObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number(valor) || 0)
  }

  // =========================================================
  // ESTADÍSTICAS DE VENTAS
  // =========================================================

  const totalHistorial = useMemo(() => {
    return ventas.reduce(
      (total, venta) =>
        total + (Number(venta.total) || 0),
      0
    )
  }, [ventas])

  const unidadesHistorial = useMemo(() => {
    return ventas.reduce((total, venta) => {
      const cantidad = (
        venta.productos || []
      ).reduce(
        (suma, producto) =>
          suma +
          (Number(producto.cantidad) || 0),
        0
      )

      return total + cantidad
    }, 0)
  }, [ventas])

  const ventasPaginadas = useMemo(() => {
    const inicio =
      (paginaVentas - 1) *
      elementosPorPagina

    return ventas.slice(
      inicio,
      inicio + elementosPorPagina
    )
  }, [ventas, paginaVentas])

  const ventasReporte =
    reporte?.ventas || []

  const ventasReportePaginadas = useMemo(() => {
    const inicio =
      (paginaReporte - 1) *
      elementosPorPagina

    return ventasReporte.slice(
      inicio,
      inicio + elementosPorPagina
    )
  }, [ventasReporte, paginaReporte])

  const totalPaginasVentas = Math.max(
    1,
    Math.ceil(
      ventas.length / elementosPorPagina
    )
  )

  const totalPaginasReporte = Math.max(
    1,
    Math.ceil(
      ventasReporte.length /
        elementosPorPagina
    )
  )

  const resumenReporte =
    reporte?.resumen || {}

  const ventasRealizadasReporte =
    Number(
      resumenReporte.ventas_realizadas
    ) || ventasReporte.length

  const unidadesVendidasReporte =
    Number(
      resumenReporte.unidades_vendidas
    ) || 0

  const totalVendidoReporte =
    Number(
      resumenReporte.total_vendido
    ) || 0

  // =========================================================
  // ESTADO DE VENTA
  // =========================================================

  const obtenerEstiloEstado = (estado) => {
    const estadoNormalizado = String(
      estado || ''
    )
      .trim()
      .toLowerCase()

    if (
      estadoNormalizado === 'pagado' ||
      estadoNormalizado === 'completado' ||
      estadoNormalizado === 'entregado'
    ) {
      return modoOscuro
        ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    }

    if (
      estadoNormalizado === 'pendiente' ||
      estadoNormalizado === 'en proceso' ||
      estadoNormalizado === 'procesando'
    ) {
      return modoOscuro
        ? 'bg-amber-900/50 text-amber-300 border border-amber-700'
        : 'bg-amber-100 text-amber-700 border border-amber-200'
    }

    if (
      estadoNormalizado === 'cancelado' ||
      estadoNormalizado === 'cancelada'
    ) {
      return modoOscuro
        ? 'bg-red-900/50 text-red-300 border border-red-700'
        : 'bg-red-100 text-red-700 border border-red-200'
    }

    return modoOscuro
      ? 'bg-slate-800 text-slate-300 border border-slate-700'
      : 'bg-slate-100 text-slate-600 border border-slate-200'
  }

  const obtenerTextoEstado = (estado) => {
    if (!estado) return 'Sin estado'

    const texto = String(estado).trim()

    if (!texto) return 'Sin estado'

    return texto.charAt(0).toUpperCase() +
      texto.slice(1)
  }

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  const BotonesPaginacion = ({
    pagina,
    totalPaginas,
    setPagina,
  }) => {
    if (totalPaginas <= 1) {
      return null
    }

    return (
      <div className="flex items-center justify-center gap-3 py-3">
        <button
          type="button"
          onClick={() =>
            setPagina((actual) =>
              Math.max(1, actual - 1)
            )
          }
          disabled={pagina === 1}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
            modoOscuro
              ? 'border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30'
          }`}
        >
          <ChevronLeft size={17} />
        </button>

        <span
          className={`text-xs ${secundario}`}
        >
          Página {pagina} de {totalPaginas}
        </span>

        <button
          type="button"
          onClick={() =>
            setPagina((actual) =>
              Math.min(
                totalPaginas,
                actual + 1
              )
            )
          }
          disabled={
            pagina === totalPaginas
          }
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
            modoOscuro
              ? 'border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30'
          }`}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    )
  }

  // =========================================================
  // MENÚ
  // =========================================================

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista)
  }

  // =========================================================
  // RENDER
  // =========================================================

  if (!usuario) {
    return (
      <main
        className={`flex h-screen items-center justify-center ${fondo}`}
      >
        <p className={secundario}>
          Cargando panel...
        </p>
      </main>
    )
  }

  return (
    <div
      className={`h-screen overflow-hidden ${fondo}`}
    >
      <div className="flex h-screen overflow-hidden">

        {/* =================================================
            SIDEBAR
        ================================================== */}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[245px] flex-col border-r ${
            modoOscuro
              ? 'border-slate-800 bg-[#0b1625]'
              : 'border-slate-200 bg-white'
          }`}
        >
          {/* LOGO */}

          <div
            className={`flex h-[90px] shrink-0 items-center justify-center border-b ${
              modoOscuro
                ? 'border-slate-800'
                : 'border-slate-200'
            }`}
          >
            <img
              src={
                modoOscuro
                  ? logoDark
                  : logo
              }
              alt="CellWorld"
              className="w-[100px] object-contain"
            />
          </div>

          {/* INFORMACIÓN */}

          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <User size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold">
                  Panel de empleado
                </p>

                <p
                  className={`truncate text-xs ${secundario}`}
                >
                  {usuario.nombres}{' '}
                  {usuario.apellidos}
                </p>
              </div>
            </div>
          </div>

          {/* MENÚ */}

          <nav className="flex-1 px-3">

            <button
              type="button"
              onClick={() =>
                cambiarVista('resumen')
              }
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                vista === 'resumen'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : modoOscuro
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 size={19} />
              Resumen
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarVista('productos')
              }
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                vista === 'productos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : modoOscuro
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package size={19} />
              Gestión de productos
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarVista('historial')
              }
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                vista === 'historial'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : modoOscuro
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag size={19} />
              Historial de ventas
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarVista('reporte')
              }
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                vista === 'reporte'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : modoOscuro
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarDays size={19} />
              Reporte diario
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarVista('perfil')
              }
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                vista === 'perfil'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : modoOscuro
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User size={19} />
              Mi perfil
            </button>

          </nav>

          {/* VOLVER */}

          <div
            className={`shrink-0 border-t p-4 ${
              modoOscuro
                ? 'border-slate-800'
                : 'border-slate-200'
            }`}
          >
            <Link
              to="/"
              className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                modoOscuro
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Volver al inicio
            </Link>
          </div>
        </aside>

        {/* =================================================
            CONTENIDO
        ================================================== */}

        <main
          className={`ml-[245px] h-screen min-w-0 flex-1 overflow-hidden ${
            modoOscuro
              ? 'bg-[#08111f]'
              : 'bg-slate-50'
          }`}
        >
          <div className="h-full w-full overflow-hidden p-5 lg:p-6">

            {/* =================================================
                RESUMEN
            ================================================== */}

            {vista === 'resumen' && (
              <div className="space-y-5">

                <div>
                  <h1 className="text-2xl font-bold">
                    Resumen
                  </h1>

                  <p
                    className={`mt-1 text-sm ${secundario}`}
                  >
                    Consulta el estado general de la tienda y tus tareas como empleado.
                  </p>
                </div>

                {cargando ? (
                  <div
                    className={`rounded-2xl border p-8 text-center shadow-sm ${tarjeta}`}
                  >
                    <p className={secundario}>
                      Cargando estadísticas...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                      <div
                        className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                            >
                              Productos
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                              {
                                estadisticas.totalProductos
                              }
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Package size={20} />
                          </div>
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                            >
                              Clientes
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                              {
                                estadisticas.totalClientes
                              }
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <Users size={20} />
                          </div>
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                            >
                              Ventas
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                              {ventas.length}
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                            <ShoppingBag size={20} />
                          </div>
                        </div>
                      </div>

                    </div>

                    <div
                      className={`rounded-2xl border p-5 shadow-sm ${tarjeta}`}
                    >
                      <div className="flex items-start gap-3">
                        <ShieldCheck
                          className="mt-0.5 text-emerald-500"
                          size={21}
                        />

                        <div>
                          <h2 className="font-bold">
                            Funciones del empleado
                          </h2>

                          <p
                            className={`mt-1 text-sm leading-6 ${secundario}`}
                          >
                            Gestiona el catálogo de productos, consulta las ventas realizadas y revisa los reportes diarios de la tienda.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                      <div
                        className={`rounded-2xl border p-5 shadow-sm ${tarjeta}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Package size={20} />
                          </div>

                          <div>
                            <h2 className="font-bold">
                              Gestión de productos
                            </h2>

                            <p
                              className={`text-sm ${secundario}`}
                            >
                              Agrega y administra productos del catálogo.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setVista('productos')
                          }
                          className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          <Plus size={17} />
                          Gestionar productos
                        </button>
                      </div>

                      <div
                        className={`rounded-2xl border p-5 shadow-sm ${tarjeta}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                            <BarChart3 size={20} />
                          </div>

                          <div>
                            <h2 className="font-bold">
                              Ventas y reportes
                            </h2>

                            <p
                              className={`text-sm ${secundario}`}
                            >
                              Consulta el historial y los resultados diarios.
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setVista('historial')
                            }
                            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                              modoOscuro
                                ? 'border-blue-800 bg-blue-950/40 text-blue-300 hover:bg-blue-900/50'
                                : 'border-blue-200 bg-white text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            Ver ventas
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setVista('reporte')
                            }
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            Ver reporte
                          </button>
                        </div>
                      </div>

                    </div>
                  </>
                )}
              </div>
            )}

            {/* =================================================
                PRODUCTOS
            ================================================== */}

            {vista === 'productos' && (
              <div className="space-y-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      Gestión de productos
                    </h1>

                    <p
                      className={`mt-1 text-sm ${secundario}`}
                    >
                      Agrega nuevos productos al catálogo de CellWorld.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/productos')
                    }
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${botonSecundario}`}
                  >
                    <Package size={17} />
                    Ver catálogo
                  </button>
                </div>

                <EmployeeProductForm
                  modoOscuro={modoOscuro}
                  onCreated={() =>
                    cargarDatos(
                      localStorage.getItem(
                        'token'
                      )
                    )
                  }
                />

              </div>
            )}

            {/* =================================================
                HISTORIAL DE VENTAS
            ================================================== */}

            {vista === 'historial' && (
              <div className="space-y-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      Historial de ventas
                    </h1>

                    <p
                      className={`mt-1 text-sm ${secundario}`}
                    >
                      Consulta las ventas registradas en CellWorld.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cargarVentas}
                    disabled={cargandoVentas}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${botonSecundario}`}
                  >
                    <RefreshCw
                      size={17}
                      className={
                        cargandoVentas
                          ? 'animate-spin'
                          : ''
                      }
                    />

                    Actualizar
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <div
                    className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                        >
                          Ventas
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                          {ventas.length}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <ShoppingBag size={20} />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                        >
                          Unidades
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                          {unidadesHistorial}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <Boxes size={20} />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                        >
                          Total vendido
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {formatearPrecio(
                            totalHistorial
                          )}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                        <DollarSign size={20} />
                      </div>
                    </div>
                  </div>

                </div>

                {errorVentas && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      modoOscuro
                        ? 'border-red-800 bg-red-950/40 text-red-300'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {errorVentas}
                  </div>
                )}

                <div
                  className={`overflow-hidden rounded-2xl border shadow-sm ${tarjeta}`}
                >

                  <div
                    className={`flex items-center justify-between border-b px-5 py-4 ${
                      modoOscuro
                        ? 'border-slate-700'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <h2 className="font-bold">
                        Ventas registradas
                      </h2>

                      <p
                        className={`mt-0.5 text-xs ${secundario}`}
                      >
                        Historial de pedidos realizados.
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${etiquetaNeutral}`}
                    >
                      {ventas.length} ventas
                    </span>
                  </div>

                  <div className={fondoTabla}>
                    <table className="w-full table-fixed text-left text-xs">

                      <thead className={encabezadoTabla}>
                        <tr>
                          <th className="w-[10%] px-4 py-3 font-semibold">
                            Venta
                          </th>

                          <th className="w-[20%] px-4 py-3 font-semibold">
                            Cliente
                          </th>

                          <th className="w-[17%] px-4 py-3 font-semibold">
                            Fecha
                          </th>

                          <th className="w-[25%] px-4 py-3 font-semibold">
                            Productos
                          </th>

                          <th className="w-[13%] px-4 py-3 font-semibold">
                            Estado
                          </th>

                          <th className="w-[15%] px-4 py-3 text-right font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {cargandoVentas ? (
                          <tr>
                            <td
                              colSpan="6"
                              className={`px-4 py-10 text-center ${secundario}`}
                            >
                              Cargando ventas...
                            </td>
                          </tr>
                        ) : ventasPaginadas.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              className={`px-4 py-10 text-center ${secundario}`}
                            >
                              No hay ventas registradas.
                            </td>
                          </tr>
                        ) : (
                          ventasPaginadas.map(
                            (venta, index) => {
                              const productosVenta =
                                venta.productos || []

                              const cliente =
                                venta.cliente ||
                                venta.nombre_cliente ||
                                'Cliente'

                              const estado =
                                venta.estado ||
                                'Sin estado'

                              return (
                                <tr
                                  key={
                                    venta.id_pedido ||
                                    venta.id ||
                                    index
                                  }
                                  className={`border-t transition ${fila}`}
                                >
                                  <td className="px-4 py-3 font-semibold">
                                    #
                                    {venta.id_pedido ||
                                      venta.id ||
                                      '-'}
                                  </td>

                                  <td className="px-4 py-3">
                                    <span className="block truncate font-medium">
                                      {cliente}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3">
                                    <span className="block truncate">
                                      {formatearFecha(
                                        venta.fecha
                                      )}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3">
                                    <span className="block truncate">
                                      {productosVenta
                                        .map(
                                          (producto) =>
                                            `${producto.nombre || 'Producto'} x${producto.cantidad || 0}`
                                        )
                                        .join(
                                          ', '
                                        ) ||
                                        'Sin productos'}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${obtenerEstiloEstado(
                                        estado
                                      )}`}
                                    >
                                      {obtenerTextoEstado(
                                        estado
                                      )}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3 text-right font-bold">
                                    {formatearPrecio(
                                      venta.total
                                    )}
                                  </td>
                                </tr>
                              )
                            }
                          )
                        )}

                      </tbody>

                    </table>
                  </div>

                  <div
                    className={`border-t px-5 ${
                      modoOscuro
                        ? 'border-slate-700'
                        : 'border-slate-200'
                    }`}
                  >
                    <BotonesPaginacion
                      pagina={paginaVentas}
                      totalPaginas={
                        totalPaginasVentas
                      }
                      setPagina={
                        setPaginaVentas
                      }
                    />
                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                REPORTE DIARIO
            ================================================== */}

            {vista === 'reporte' && (
              <div className="space-y-4">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                  <div>
                    <h1 className="text-2xl font-bold">
                      Reporte diario de ventas
                    </h1>

                    <p
                      className={`mt-1 text-sm ${secundario}`}
                    >
                      Consulta las ventas realizadas en una fecha específica.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">

                    <div>
                      <label
                        className={`mb-1 block text-xs font-semibold ${secundario}`}
                      >
                        Fecha
                      </label>

                      <input
                        type="date"
                        value={fechaReporte}
                        onChange={(event) =>
                          setFechaReporte(
                            event.target.value
                          )
                        }
                        className={`rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${
                          modoOscuro
                            ? 'border-slate-700 bg-[#0d1929] text-white'
                            : 'border-slate-200 bg-white text-slate-900'
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        cargarReporte(
                          fechaReporte
                        )
                      }
                      disabled={cargandoReporte}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      <Search size={17} />

                      {cargandoReporte
                        ? 'Consultando...'
                        : 'Consultar'}
                    </button>

                  </div>

                </div>

                {errorReporte && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      modoOscuro
                        ? 'border-red-800 bg-red-950/40 text-red-300'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {errorReporte}
                  </div>
                )}

                {reporte && (
                  <>

                    <div
                      className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                          <CalendarDays size={20} />
                        </div>

                        <div>
                          <p
                            className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                          >
                            Fecha consultada
                          </p>

                          <p className="mt-1 text-base font-bold capitalize">
                            {formatearFechaCorta(
                              fechaReporte
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                      <div
                        className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                            >
                              Ventas realizadas
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                              {
                                ventasRealizadasReporte
                              }
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <ShoppingBag size={20} />
                          </div>
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                            >
                              Unidades vendidas
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                              {
                                unidadesVendidasReporte
                              }
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <Boxes size={20} />
                          </div>
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl border p-4 shadow-sm ${tarjeta}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={`text-xs font-medium uppercase tracking-wide ${secundario}`}
                            >
                              Total vendido
                            </p>

                            <p className="mt-1 text-xl font-bold">
                              {formatearPrecio(
                                totalVendidoReporte
                              )}
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                            <DollarSign size={20} />
                          </div>
                        </div>
                      </div>

                    </div>

                    <div
                      className={`overflow-hidden rounded-2xl border shadow-sm ${tarjeta}`}
                    >

                      <div
                        className={`flex items-center justify-between border-b px-5 py-4 ${
                          modoOscuro
                            ? 'border-slate-700'
                            : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <h2 className="font-bold">
                            Ventas del día
                          </h2>

                          <p
                            className={`mt-0.5 text-xs ${secundario}`}
                          >
                            Detalle de las ventas realizadas en la fecha seleccionada.
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${etiquetaNeutral}`}
                        >
                          {
                            ventasReporte.length
                          } ventas
                        </span>
                      </div>

                      <div className={fondoTabla}>
                        <table className="w-full table-fixed text-left text-xs">

                          <thead className={encabezadoTabla}>
                            <tr>
                              <th className="w-[10%] px-4 py-3 font-semibold">
                                Venta
                              </th>

                              <th className="w-[23%] px-4 py-3 font-semibold">
                                Cliente
                              </th>

                              <th className="w-[30%] px-4 py-3 font-semibold">
                                Productos
                              </th>

                              <th className="w-[17%] px-4 py-3 font-semibold">
                                Estado
                              </th>

                              <th className="w-[20%] px-4 py-3 text-right font-semibold">
                                Total
                              </th>
                            </tr>
                          </thead>

                          <tbody>

                            {ventasReportePaginadas.length ===
                            0 ? (
                              <tr>
                                <td
                                  colSpan="5"
                                  className={`px-4 py-10 text-center ${secundario}`}
                                >
                                  No hay ventas para la fecha seleccionada.
                                </td>
                              </tr>
                            ) : (
                              ventasReportePaginadas.map(
                                (venta, index) => {
                                  const productosVenta =
                                    venta.productos ||
                                    []

                                  const cliente =
                                    venta.cliente ||
                                    venta.nombre_cliente ||
                                    'Cliente'

                                  const estado =
                                    venta.estado ||
                                    'Sin estado'

                                  return (
                                    <tr
                                      key={
                                        venta.id_pedido ||
                                        venta.id ||
                                        index
                                      }
                                      className={`border-t transition ${fila}`}
                                    >
                                      <td className="px-4 py-3 font-semibold">
                                        #
                                        {venta.id_pedido ||
                                          venta.id ||
                                          '-'}
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="block truncate font-medium">
                                          {cliente}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="block truncate">
                                          {productosVenta
                                            .map(
                                              (
                                                producto
                                              ) =>
                                                `${producto.nombre || 'Producto'} x${producto.cantidad || 0}`
                                            )
                                            .join(
                                              ', '
                                            ) ||
                                            'Sin productos'}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span
                                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${obtenerEstiloEstado(
                                            estado
                                          )}`}
                                        >
                                          {obtenerTextoEstado(
                                            estado
                                          )}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3 text-right font-bold">
                                        {formatearPrecio(
                                          venta.total
                                        )}
                                      </td>
                                    </tr>
                                  )
                                }
                              )
                            )}

                          </tbody>

                        </table>
                      </div>

                      <div
                        className={`border-t px-5 ${
                          modoOscuro
                            ? 'border-slate-700'
                            : 'border-slate-200'
                        }`}
                      >
                        <BotonesPaginacion
                          pagina={
                            paginaReporte
                          }
                          totalPaginas={
                            totalPaginasReporte
                          }
                          setPagina={
                            setPaginaReporte
                          }
                        />
                      </div>

                    </div>

                  </>
                )}

              </div>
            )}

            {/* =================================================
                PERFIL
            ================================================== */}

            {vista === 'perfil' && (
              <div className="space-y-5">

                <div>
                  <h1 className="text-2xl font-bold">
                    Mi perfil
                  </h1>

                  <p
                    className={`mt-1 text-sm ${secundario}`}
                  >
                    Información de tu cuenta de empleado.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-6 shadow-sm ${tarjeta}`}
                >

                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <User size={27} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">
                        {usuario.nombres}{' '}
                        {usuario.apellidos}
                      </h2>

                      <p
                        className={`text-sm ${secundario}`}
                      >
                        Empleado de CellWorld
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div
                      className={`rounded-xl border p-4 ${
                        modoOscuro
                          ? 'border-slate-700 bg-[#17263c]'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p
                        className={`text-xs uppercase tracking-wide ${secundario}`}
                      >
                        Nombre completo
                      </p>

                      <p className="mt-2 font-semibold">
                        {usuario.nombres}{' '}
                        {usuario.apellidos}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-4 ${
                        modoOscuro
                          ? 'border-slate-700 bg-[#17263c]'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p
                        className={`text-xs uppercase tracking-wide ${secundario}`}
                      >
                        Correo electrónico
                      </p>

                      <p className="mt-2 flex items-center gap-2 font-semibold text-blue-500">
                        <Mail size={16} />
                        {usuario.email}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-4 ${
                        modoOscuro
                          ? 'border-slate-700 bg-[#17263c]'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p
                        className={`text-xs uppercase tracking-wide ${secundario}`}
                      >
                        Rol
                      </p>

                      <p className="mt-2 font-semibold">
                        Empleado
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-4 ${
                        modoOscuro
                          ? 'border-slate-700 bg-[#17263c]'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p
                        className={`text-xs uppercase tracking-wide ${secundario}`}
                      >
                        Estado
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          usuario.estado
                            ? modoOscuro
                              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : modoOscuro
                              ? 'bg-red-900/50 text-red-300 border border-red-700'
                              : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {usuario.estado
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  )
}

export default PanelEmpleado
