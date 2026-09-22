import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  Users,
  RefreshCw,
  ShoppingBag,
  CalendarDays,
  DollarSign,
  Search,
  UserCheck,
  UserX,
  Boxes,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Ban,
  ClipboardList,
  MessageSquareWarning,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'
import { API_URL } from '../config'


function obtenerTextoPqr(valor, respaldo = '') {
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

function PanelAdmin({ modoOscuro }) {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [pqrs, setPqrs] = useState([])

  const [cargandoUsuarios, setCargandoUsuarios] = useState(false)
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [cargandoVentas, setCargandoVentas] = useState(false)
  const [cargandoPqrs, setCargandoPqrs] = useState(false)
  const [cargandoReporte, setCargandoReporte] = useState(false)

  const [errorUsuarios, setErrorUsuarios] = useState('')
  const [errorProductos, setErrorProductos] = useState('')
  const [errorVentas, setErrorVentas] = useState('')
  const [errorPqrs, setErrorPqrs] = useState('')
  const [errorReporte, setErrorReporte] = useState('')

  const [vista, setVista] = useState(() => {
    return sessionStorage.getItem('panelAdminVista') || 'resumen'
  })

  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false)
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false)
  const [mostrarModalPqr, setMostrarModalPqr] = useState(false)

  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [productoEditando, setProductoEditando] = useState(null)
  const [pqrEditando, setPqrEditando] = useState(null)
  const [respuestaPqr, setRespuestaPqr] = useState('')
  const [estadoPqr, setEstadoPqr] = useState('Resuelta')

  const [guardandoUsuario, setGuardandoUsuario] = useState(false)
  const [guardandoProducto, setGuardandoProducto] = useState(false)
  const [guardandoPqr, setGuardandoPqr] = useState(false)

  const [paginaUsuarios, setPaginaUsuarios] = useState(1)
  const [paginaProductos, setPaginaProductos] = useState(1)
  const [paginaVentas, setPaginaVentas] = useState(1)
  const [paginaPqrs, setPaginaPqrs] = useState(1)
  const [paginaReporte, setPaginaReporte] = useState(1)

  const [fechaReporte, setFechaReporte] = useState(() => {
    const hoy = new Date()
    const año = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')

    return `${año}-${mes}-${dia}`
  })

  const [reporte, setReporte] = useState(null)
  const [estadisticasDashboard, setEstadisticasDashboard] = useState(null)
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false)
  const [errorEstadisticas, setErrorEstadisticas] = useState('')
  const [filtrosDashboard, setFiltrosDashboard] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    producto: '',
    estado: '',
    cliente_id: '',
  })

  const elementosPorPagina = 5

  const tema = {
    fondo: modoOscuro
      ? 'bg-slate-950'
      : 'bg-slate-100',

    panel: modoOscuro
      ? 'bg-slate-900 border-slate-800'
      : 'bg-white border-slate-200',

    panelSecundario: modoOscuro
      ? 'bg-slate-800/70 border-slate-700'
      : 'bg-slate-50 border-slate-200',

    texto: modoOscuro
      ? 'text-white'
      : 'text-slate-900',

    textoSecundario: modoOscuro
      ? 'text-slate-400'
      : 'text-slate-500',

    borde: modoOscuro
      ? 'border-slate-800'
      : 'border-slate-200',

    input: modoOscuro
      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
  }

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista)
    sessionStorage.setItem(
      'panelAdminVista',
      nuevaVista
    )
  }

  const obtenerToken = () => {
    return localStorage.getItem('token')
  }

  const manejarRespuestaNoAutorizada = (respuesta) => {
    if (respuesta.status === 401 || respuesta.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      navigate('/login')
      return true
    }

    return false
  }

  useEffect(() => {
    try {
      const usuarioGuardado =
        localStorage.getItem('usuario')

      if (!usuarioGuardado) {
        navigate('/login')
        return
      }

      const usuarioParseado =
        JSON.parse(usuarioGuardado)

      setUsuario(usuarioParseado)

      const rol =
        Number(
          usuarioParseado.id_rol ??
          usuarioParseado.rol_id ??
          usuarioParseado.rol
        )

      if (rol !== 1) {
        navigate('/')
      }
    } catch (error) {
      console.error(error)
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    cargarUsuarios()
    cargarProductos()
    cargarVentas()
    cargarPqrs()
    cargarEstadisticasDashboard()
  }, [])

  useEffect(() => {
    if (vista === 'reporte') {
      cargarReporte(fechaReporte)
    }
  }, [vista])

  const cargarUsuarios = async () => {
    setCargandoUsuarios(true)
    setErrorUsuarios('')

    try {
      const token = obtenerToken()

      const respuesta = await fetch(
        `${API_URL}/api/usuarios`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (manejarRespuestaNoAutorizada(respuesta)) {
        return
      }

      if (!respuesta.ok) {
        throw new Error(
          'No se pudieron cargar los usuarios.'
        )
      }

      const data = await respuesta.json()

      setUsuarios(
        Array.isArray(data)
          ? data
          : data.usuarios || []
      )
    } catch (error) {
      console.error(error)
      setErrorUsuarios(
        error.message ||
          'No se pudieron cargar los usuarios.'
      )
    } finally {
      setCargandoUsuarios(false)
    }
  }

  const cargarProductos = async () => {
    setCargandoProductos(true)
    setErrorProductos('')

    try {
      const token = obtenerToken()

      const respuesta = await fetch(
        `${API_URL}/api/productos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (manejarRespuestaNoAutorizada(respuesta)) {
        return
      }

      if (!respuesta.ok) {
        throw new Error(
          'No se pudieron cargar los productos.'
        )
      }

      const data = await respuesta.json()

      setProductos(
        Array.isArray(data)
          ? data
          : data.productos || []
      )
    } catch (error) {
      console.error(error)
      setErrorProductos(
        error.message ||
          'No se pudieron cargar los productos.'
      )
    } finally {
      setCargandoProductos(false)
    }
  }

  const cargarVentas = async () => {
    setCargandoVentas(true)
    setErrorVentas('')

    try {
      const token = obtenerToken()

      const respuesta = await fetch(
        `${API_URL}/api/pedidos/historial`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (manejarRespuestaNoAutorizada(respuesta)) {
        return
      }

      if (!respuesta.ok) {
        throw new Error(
          'No se pudo cargar el historial de ventas.'
        )
      }

      const data = await respuesta.json()

      setVentas(
        Array.isArray(data)
          ? data
          : data.ventas ||
            data.pedidos ||
            data.historial ||
            []
      )
    } catch (error) {
      console.error(error)
      setErrorVentas(
        error.message ||
          'No se pudo cargar el historial de ventas.'
      )
    } finally {
      setCargandoVentas(false)
    }
  }

  const cargarPqrs = async () => {
    setCargandoPqrs(true)
    setErrorPqrs('')

    try {
      const token = obtenerToken()
      const rutas = ['/api/pqr', '/api/pqr']
      let respuesta

      for (const ruta of rutas) {
        const intento = await fetch(`${API_URL}${ruta}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (manejarRespuestaNoAutorizada(intento)) return
        if (intento.ok) {
          respuesta = intento
          break
        }
      }

      if (!respuesta) {
        throw new Error('No se pudieron cargar las PQR.')
      }

      const data = await respuesta.json()
      setPqrs(
        Array.isArray(data)
          ? data
          : data.pqrs || data.pqr || data.solicitudes || []
      )
    } catch (error) {
      console.error(error)
      setErrorPqrs(error.message || 'No se pudieron cargar las PQR.')
    } finally {
      setCargandoPqrs(false)
    }
  }

  const abrirResponderPqr = (pqr) => {
    setPqrEditando(pqr)
    setRespuestaPqr(obtenerTextoPqr(pqr?.respuesta))

    const estadoActual = obtenerEstadoPqr(pqr)
    setEstadoPqr(
      ['En proceso', 'Respondida', 'Resuelta', 'Cerrada'].includes(estadoActual)
        ? estadoActual
        : 'Respondida'
    )
    setMostrarModalPqr(true)
  }

  const cerrarModalPqr = () => {
    setMostrarModalPqr(false)
    setPqrEditando(null)
    setRespuestaPqr('')
    setEstadoPqr('Respondida')
  }

  const guardarRespuestaPqr = async (event) => {
    event.preventDefault()

    const idPqr = obtenerIdPqr(pqrEditando)
    if (!idPqr) return

    setGuardandoPqr(true)

    try {
      const token = obtenerToken()
      const respuesta = await fetch(
        `${API_URL}/api/pqr/${idPqr}/respuesta`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            respuesta: respuestaPqr,
            estado: estadoPqr,
          }),
        }
      )

      if (manejarRespuestaNoAutorizada(respuesta)) return

      const data = await respuesta.json().catch(() => null)
      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeApi(
            data,
            'No se pudo actualizar la PQR.'
          )
        )
      }

      cerrarModalPqr()
      await cargarPqrs()
    } catch (error) {
      console.error(error)
      alert(
        obtenerTextoPqr(
          error?.message,
          'No se pudo actualizar la PQR.'
        )
      )
    } finally {
      setGuardandoPqr(false)
    }
  }

  const cargarReporte = async (fecha) => {
    setCargandoReporte(true)
    setErrorReporte('')

    try {
      const token = obtenerToken()

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

      if (manejarRespuestaNoAutorizada(respuesta)) {
        return
      }

      if (!respuesta.ok) {
        throw new Error(
          'No se pudo cargar el reporte diario.'
        )
      }

      const data = await respuesta.json()

      setReporte(data)
      setPaginaReporte(1)
    } catch (error) {
      console.error(error)
      setReporte(null)

      setErrorReporte(
        error.message ||
          'No se pudo cargar el reporte diario.'
      )
    } finally {
      setCargandoReporte(false)
    }
  }

  const cargarEstadisticasDashboard = async () => {
    setCargandoEstadisticas(true)
    setErrorEstadisticas('')

    try {
      const parametros = new URLSearchParams()

      Object.entries(filtrosDashboard).forEach(([clave, valor]) => {
        if (valor) parametros.set(clave, valor)
      })

      const respuesta = await fetch(
        `${API_URL}/api/pedidos/estadisticas?${parametros.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${obtenerToken()}`,
          },
        }
      )

      const data = await respuesta.json().catch(() => null)

      if (manejarRespuestaNoAutorizada(respuesta)) return

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeApi(
            data,
            'No se pudieron cargar las estadísticas.'
          )
        )
      }

      setEstadisticasDashboard(data)
    } catch (error) {
      setErrorEstadisticas(
        obtenerTextoPqr(
          error?.message,
          'No se pudieron cargar las estadísticas.'
        )
      )
    } finally {
      setCargandoEstadisticas(false)
    }
  }

  const abrirNuevoUsuario = () => {
    setUsuarioEditando({
      nombres: '',
      apellidos: '',
      tipo_documento: 'CC',
      numero_documento: '',
      direccion: '',
      telefono: '',
      email: '',
      password: '',
      rol_id: 2,
      estado: 1,
    })

    setMostrarModalUsuario(true)
  }

  const abrirEditarUsuario = (usuarioSeleccionado) => {
    setUsuarioEditando({
      ...usuarioSeleccionado,
      password: '',
      rol_id:
        usuarioSeleccionado.rol_id ??
        usuarioSeleccionado.id_rol ??
        2,
    })

    setMostrarModalUsuario(true)
  }

  const obtenerIdRolUsuario = (usuarioSeleccionado) => {
    return Number(
      usuarioSeleccionado?.rol_id ??
      usuarioSeleccionado?.id_rol ??
      usuarioSeleccionado?.rol?.id_rol ??
      usuarioSeleccionado?.rol ??
      0
    )
  }

  const obtenerNombreRolUsuario = (
    usuarioSeleccionado
  ) => {
    const rol = obtenerIdRolUsuario(
      usuarioSeleccionado
    )

    if (rol === 1) return 'Administrador'
    if (rol === 2) return 'Cliente'
    if (rol === 3) return 'Empleado'

    return (
      usuarioSeleccionado?.nombre_rol ||
      usuarioSeleccionado?.rol_nombre ||
      'Sin rol'
    )
  }

  const obtenerNombreUsuario = (
    usuarioSeleccionado
  ) => {
    if (!usuarioSeleccionado) {
      return 'Usuario'
    }

    const nombre =
      usuarioSeleccionado.nombres ||
      usuarioSeleccionado.nombre ||
      usuarioSeleccionado.name ||
      ''

    const apellido =
      usuarioSeleccionado.apellidos ||
      usuarioSeleccionado.apellido ||
      ''

    const completo =
      `${nombre} ${apellido}`.trim()

    return (
      completo ||
      usuarioSeleccionado.email ||
      'Usuario'
    )
  }

  const eliminarUsuario = async (
    usuarioSeleccionado
  ) => {
    if (!usuarioSeleccionado?.id_usuario) {
      return
    }

    const confirmar = window.confirm(
      `¿Deseas eliminar a ${obtenerNombreUsuario(
        usuarioSeleccionado
      )}?`
    )

    if (!confirmar) {
      return
    }

    try {
      const token = obtenerToken()

      const respuesta = await fetch(
        `${API_URL}/api/usuarios/${usuarioSeleccionado.id_usuario}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (manejarRespuestaNoAutorizada(respuesta)) {
        return
      }

      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => null)

        throw new Error(
          data?.detail ||
            'No se pudo eliminar el usuario.'
        )
      }

      await cargarUsuarios()
    } catch (error) {
      console.error(error)
      alert(
        error.message ||
          'No se pudo eliminar el usuario.'
      )
    }
  }

  const cambiarEstadoUsuario = async (
    usuarioSeleccionado
  ) => {
    if (!usuarioSeleccionado?.id_usuario) {
      return
    }

    const estadoActual =
      Number(usuarioSeleccionado.estado) === 1 ||
      usuarioSeleccionado.estado === true

    const nuevoEstado = estadoActual ? 0 : 1

    try {
      const token = obtenerToken()

      const respuesta = await fetch(
        `${API_URL}/api/usuarios/${usuarioSeleccionado.id_usuario}/estado`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        }
      )

      if (manejarRespuestaNoAutorizada(respuesta)) {
        return
      }

      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => null)

        throw new Error(
          data?.detail ||
            'No se pudo cambiar el estado.'
        )
      }

      await cargarUsuarios()
    } catch (error) {
      console.error(error)
      alert(
        error.message ||
          'No se pudo cambiar el estado.'
      )
    }
  }

  const guardarUsuario = async (event) => {
    event.preventDefault()

    if (!usuarioEditando) {
      return
    }

    setGuardandoUsuario(true)

    try {
      const token = obtenerToken()

      const esEdicion =
        Boolean(
          usuarioEditando.id_usuario
        )

      const url = esEdicion
        ? `${API_URL}/api/usuarios/${usuarioEditando.id_usuario}`
        : `${API_URL}/api/usuarios/admin`

      const method = esEdicion
        ? 'PUT'
        : 'POST'

      const cuerpo = {
        nombres:
          usuarioEditando.nombres || '',
        apellidos:
          usuarioEditando.apellidos || '',
        tipo_documento:
          usuarioEditando.tipo_documento || 'CC',
        numero_documento:
          usuarioEditando.numero_documento || '',
        direccion:
          usuarioEditando.direccion || '',
        telefono:
          usuarioEditando.telefono || '',
        email:
          usuarioEditando.email || '',
        rol_id:
          Number(usuarioEditando.rol_id) || 2,
        estado:
          Number(usuarioEditando.estado) === 1
            ? 1
            : 0,
      }

      if (
        !esEdicion ||
        usuarioEditando.password
      ) {
        cuerpo.password =
          usuarioEditando.password || ''
      }

      const respuesta = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cuerpo),
      })

      if (manejarRespuestaNoAutorizada(respuesta)) {
        return
      }

      const data = await respuesta
        .json()
        .catch(() => null)

      if (!respuesta.ok) {
        throw new Error(
          data?.detail ||
            'No se pudo guardar el usuario.'
        )
      }

      setMostrarModalUsuario(false)
      setUsuarioEditando(null)

      await cargarUsuarios()
    } catch (error) {
      console.error(error)
      alert(
        error.message ||
          'No se pudo guardar el usuario.'
      )
    } finally {
      setGuardandoUsuario(false)
    }
  }

  const abrirNuevoProducto = () => {
    setProductoEditando({
      nombre_producto: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      imagen: '',
    })

    setMostrarModalProducto(true)
  }

  const abrirEditarProducto = (
    productoSeleccionado
  ) => {
    setProductoEditando({
      ...productoSeleccionado,
      precio:
        productoSeleccionado.precio ??
        productoSeleccionado.precio_unitario ??
        '',
      stock:
        productoSeleccionado.stock ??
        productoSeleccionado.cantidad ??
        '',
    })

    setMostrarModalProducto(true)
  }

  const eliminarProducto = async (
    productoSeleccionado
  ) => {
    const idProducto =
      productoSeleccionado?.id_producto ??
      productoSeleccionado?.id

    if (!idProducto) {
      return
    }

    const nombre =
      productoSeleccionado.nombre_producto ||
      productoSeleccionado.nombre ||
      'este producto'

    const confirmar = window.confirm(
      `¿Deseas eliminar ${nombre}?`
    )

    if (!confirmar) {
      return
    }

    try {
      const token = obtenerToken()

      const respuesta = await fetch(
        `${API_URL}/api/productos/${idProducto}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (manejarRespuestaNoAutorizada(respuesta)) {
        return
      }

      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => null)

        throw new Error(
          data?.detail ||
            'No se pudo eliminar el producto.'
        )
      }

      await cargarProductos()
    } catch (error) {
      console.error(error)
      alert(
        error.message ||
          'No se pudo eliminar el producto.'
      )
    }
  }

  const guardarProducto = async (event) => {
    event.preventDefault()

    if (!productoEditando) {
      return
    }

    setGuardandoProducto(true)

    try {
      const token = obtenerToken()

      const idProducto =
        productoEditando.id_producto ??
        productoEditando.id

      const esEdicion =
        Boolean(idProducto)

      const url = esEdicion
        ? `${API_URL}/api/productos/${idProducto}`
        : `${API_URL}/api/productos`

      const method = esEdicion
        ? 'PUT'
        : 'POST'

      const cuerpo = {
        nombre:
          productoEditando.nombre_producto ||
          productoEditando.nombre ||
          '',
        categoria:
          productoEditando.categoria ||
          '',
        descripcion:
          productoEditando.descripcion ||
          null,
        almacenamiento:
          productoEditando.almacenamiento ||
          null,
        ram:
          productoEditando.ram ||
          null,
        color:
          productoEditando.color ||
          null,
        precio:
          Number(productoEditando.precio) || 0,
        imagen:
          productoEditando.imagen ||
          null,
        stock:
          Number(productoEditando.stock) || 0,
      }

      const respuesta = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cuerpo),
      })

      if (manejarRespuestaNoAutorizada(respuesta)) {
        return
      }

      const data = await respuesta
        .json()
        .catch(() => null)

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeApi(
            data,
            'No se pudo guardar el producto.'
          )
        )
      }

      setMostrarModalProducto(false)
      setProductoEditando(null)

      await cargarProductos()
    } catch (error) {
      console.error(error)
      alert(
        obtenerTextoPqr(
          error?.message,
          'No se pudo guardar el producto.'
        )
      )
    } finally {
      setGuardandoProducto(false)
    }
  }

  const formatearPrecio = (valor) => {
    const numero = Number(valor) || 0

    return numero.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    })
  }

  const formatearFecha = (valor) => {
    if (!valor) {
      return 'Sin fecha'
    }

    const fecha = new Date(valor)

    if (Number.isNaN(fecha.getTime())) {
      return String(valor)
    }

    return fecha.toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const formatearFechaCorta = (valor) => {
    if (!valor) {
      return ''
    }

    const fecha = new Date(
      `${valor}T00:00:00`
    )

    if (Number.isNaN(fecha.getTime())) {
      return valor
    }

    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const obtenerProductosVenta = (venta) => {
    return Array.isArray(venta?.productos)
      ? venta.productos
      : []
  }

  const obtenerNombreProducto = (producto) => {
    return (
      producto?.nombre_producto ||
      producto?.nombre ||
      'Producto'
    )
  }

  const obtenerPrecioProducto = (producto) => {
    return (
      Number(
        producto?.precio_unitario ??
        producto?.precio ??
        producto?.precio_unitario_venta ??
        0
      ) || 0
    )
  }

  const obtenerNombreClienteVenta = (venta) => {
    if (
      venta?.cliente &&
      typeof venta.cliente === 'object'
    ) {
      return (
        venta.cliente.nombre_completo ||
        venta.cliente.nombre ||
        venta.cliente.name ||
        'Cliente'
      )
    }

    return (
      (typeof venta?.cliente === 'string'
        ? venta.cliente
        : '') ||
      venta?.nombre_cliente ||
      (typeof venta?.usuario === 'string'
        ? venta.usuario
        : '') ||
      venta?.nombre_usuario ||
      'Cliente'
    )
  }

  const obtenerIdPqr = (pqr, indice = '') => {
    return pqr?.id_pqr ?? pqr?.id ?? pqr?.radicado ?? indice
  }

  const obtenerNombreClientePqr = (pqr) => {
    const cliente = pqr?.cliente || pqr?.usuario

    if (cliente && typeof cliente === 'object') {
      return (
        cliente.nombre_completo ||
        `${cliente.nombres || cliente.nombre || ''} ${cliente.apellidos || cliente.apellido || ''}`.trim() ||
        cliente.email ||
        'Cliente'
      )
    }

    return pqr?.nombre_cliente || pqr?.nombre_usuario || cliente || 'Cliente'
  }

  const obtenerEstadoPqr = (pqr) => {
    return String(pqr?.estado || pqr?.status || 'Pendiente')
  }

  const esPqrPendiente = (pqr) => {
    const estado = obtenerEstadoPqr(pqr).toLowerCase()
    return !['resuelta', 'resuelto', 'respondida', 'cerrado', 'finalizado', 'atendido'].includes(estado)
  }

  const obtenerFechaPqr = (pqr) => {
    return pqr?.fecha || pqr?.fecha_creacion || pqr?.creado_en || pqr?.created_at
  }

  const obtenerAsuntoPqr = (pqr) => {
    return pqr?.asunto || pqr?.titulo || pqr?.tipo || pqr?.descripcion || 'Sin asunto'
  }

  const convertirImagenDataURL = (src) => {
    return new Promise((resolve, reject) => {
      const imagen = new Image()

      imagen.onload = () => {
        const canvas =
          document.createElement('canvas')

        canvas.width = imagen.naturalWidth
        canvas.height = imagen.naturalHeight

        const contexto =
          canvas.getContext('2d')

        contexto.drawImage(
          imagen,
          0,
          0
        )

        resolve(
          canvas.toDataURL('image/png')
        )
      }

      imagen.onerror = reject
      imagen.src = src
    })
  }

  /*
   * ============================================================
   * GENERACIÓN DE FACTURA DE VENTA
   * ============================================================
   */

  const generarFacturaPDF = async (venta) => {
    if (!venta) {
      alert(
        'No se encontró la información de la venta.'
      )
      return
    }

    try {
      const documento = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const anchoPagina =
        documento.internal.pageSize.getWidth()

      const altoPagina =
        documento.internal.pageSize.getHeight()

      const numeroFactura =
        venta.numero_factura ||
        venta.factura ||
        venta.id_pedido ||
        venta.id ||
        'N/A'

      const fechaVenta =
        venta.fecha ||
        venta.creado_en ||
        new Date()

      const estadoFactura =
        venta.estado ||
        'Pendiente'

      const cliente =
        venta?.cliente &&
        typeof venta.cliente === 'object'
          ? venta.cliente
          : null

      const nombreCliente =
        obtenerNombreClienteVenta(venta)

      const documentoCliente =
        venta.documento_cliente ||
        venta.numero_documento_cliente ||
        venta.cedula ||
        cliente?.documento ||
        cliente?.numero_documento ||
        cliente?.cedula ||
        ''

      const correoCliente =
        venta.correo_cliente ||
        venta.email_cliente ||
        venta.email ||
        cliente?.correo ||
        cliente?.email ||
        ''

      const telefonoCliente =
        venta.telefono_cliente ||
        venta.telefono ||
        cliente?.telefono ||
        ''

      const direccionCliente =
        venta.direccion_cliente ||
        venta.direccion ||
        cliente?.direccion ||
        ''

      const productosVenta =
        obtenerProductosVenta(venta)

      const filasProductos =
        productosVenta.map(
          (producto, indice) => {
            const cantidad =
              Number(
                producto?.cantidad
              ) || 0

            const precioUnitario =
              obtenerPrecioProducto(
                producto
              )

            const subtotal =
              cantidad *
              precioUnitario

            return [
              indice + 1,
              obtenerNombreProducto(
                producto
              ),
              cantidad,
              formatearPrecio(
                precioUnitario
              ),
              formatearPrecio(
                subtotal
              ),
            ]
          }
        )

      if (
        filasProductos.length === 0
      ) {
        filasProductos.push([
          1,
          'Sin productos registrados',
          0,
          formatearPrecio(0),
          formatearPrecio(0),
        ])
      }

      const subtotalCalculado =
        productosVenta.reduce(
          (acumulado, producto) => {
            const cantidad =
              Number(
                producto?.cantidad
              ) || 0

            const precio =
              obtenerPrecioProducto(
                producto
              )

            return (
              acumulado +
              cantidad * precio
            )
          },
          0
        )

      const subtotalVenta =
        Number(
          venta.subtotal ??
          venta.sub_total
        )

      const subtotal =
        Number.isFinite(
          subtotalVenta
        ) && subtotalVenta > 0
          ? subtotalVenta
          : subtotalCalculado

      const impuesto =
        Number(
          venta.impuesto ??
          venta.iva ??
          venta.valor_iva ??
          0
        ) || 0

      const descuento =
        Number(
          venta.descuento ??
          0
        ) || 0

      const totalRegistrado =
        Number(venta.total)

      const total =
        Number.isFinite(
          totalRegistrado
        )
          ? totalRegistrado
          : subtotal +
            impuesto -
            descuento

      documento.setFillColor(
        8,
        17,
        31
      )

      documento.rect(
        0,
        0,
        anchoPagina,
        42,
        'F'
      )

      try {
        const logoData =
          await convertirImagenDataURL(
            logoDark
          )

        documento.addImage(
          logoData,
          'PNG',
          14,
          8,
          36,
          22
        )
      } catch {
        documento.setFillColor(
          37,
          99,
          235
        )

        documento.roundedRect(
          14,
          9,
          36,
          20,
          3,
          3,
          'F'
        )

        documento.setTextColor(
          255,
          255,
          255
        )

        documento.setFont(
          'helvetica',
          'bold'
        )

        documento.setFontSize(11)

        documento.text(
          'CELLWORLD',
          18,
          21
        )
      }

      documento.setTextColor(
        255,
        255,
        255
      )

      documento.setFont(
        'helvetica',
        'bold'
      )

      documento.setFontSize(19)

      documento.text(
        'FACTURA DE VENTA',
        58,
        17
      )

      documento.setFont(
        'helvetica',
        'normal'
      )

      documento.setFontSize(9)

      documento.text(
        'Sistema de gestión de ventas - CellWorld',
        58,
        24
      )

      documento.setFont(
        'helvetica',
        'bold'
      )

      documento.setFontSize(10)

      documento.text(
        `N.º ${numeroFactura}`,
        anchoPagina - 14,
        17,
        {
          align: 'right',
        }
      )

      documento.setFont(
        'helvetica',
        'normal'
      )

      documento.setFontSize(9)

      documento.text(
        `Fecha: ${formatearFecha(
          fechaVenta
        )}`,
        anchoPagina - 14,
        25,
        {
          align: 'right',
        }
      )

      documento.setFillColor(
        245,
        247,
        250
      )

      documento.roundedRect(
        14,
        50,
        anchoPagina - 28,
        39,
        3,
        3,
        'F'
      )

      documento.setTextColor(
        40,
        50,
        65
      )

      documento.setFont(
        'helvetica',
        'bold'
      )

      documento.setFontSize(11)

      documento.text(
        'DATOS DEL CLIENTE',
        20,
        59
      )

      documento.setFont(
        'helvetica',
        'normal'
      )

      documento.setFontSize(9)

      documento.text(
        `Nombre: ${nombreCliente}`,
        20,
        67
      )

      if (documentoCliente) {
        documento.text(
          `Documento: ${documentoCliente}`,
          20,
          74
        )
      }

      if (correoCliente) {
        documento.text(
          `Correo: ${correoCliente}`,
          20,
          81
        )
      }

      if (telefonoCliente) {
        documento.text(
          `Teléfono: ${telefonoCliente}`,
          105,
          67
        )
      }

      if (direccionCliente) {
        documento.text(
          `Dirección: ${direccionCliente}`,
          105,
          74
        )
      }

      documento.setTextColor(
        100,
        110,
        125
      )

      documento.setFontSize(8)

      documento.text(
        `Estado: ${estadoFactura}`,
        105,
        81
      )

      autoTable(
        documento,
        {
          startY: 98,

          head: [
            [
              '#',
              'Producto / Servicio',
              'Cantidad',
              'Precio unitario',
              'Subtotal',
            ],
          ],

          body: filasProductos,

          theme: 'grid',

          styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 3,
            textColor: [
              35,
              45,
              60,
            ],
          },

          headStyles: {
            fillColor: [
              37,
              99,
              235,
            ],
            textColor: [
              255,
              255,
              255,
            ],
            fontStyle: 'bold',
          },

          alternateRowStyles: {
            fillColor: [
              248,
              250,
              252,
            ],
          },

          columnStyles: {
            0: {
              cellWidth: 10,
              halign: 'center',
            },
            1: {
              cellWidth: 76,
            },
            2: {
              cellWidth: 22,
              halign: 'center',
            },
            3: {
              cellWidth: 35,
              halign: 'right',
            },
            4: {
              cellWidth: 35,
              halign: 'right',
            },
          },

          margin: {
            left: 14,
            right: 14,
          },
        }
      )

      const posicionFinal =
        documento.lastAutoTable?.finalY ||
        110

      const resumenInicio =
        posicionFinal + 10

      documento.setFillColor(
        248,
        250,
        252
      )

      documento.roundedRect(
        anchoPagina - 91,
        resumenInicio,
        77,
        54,
        3,
        3,
        'F'
      )

      documento.setTextColor(
        70,
        80,
        95
      )

      documento.setFont(
        'helvetica',
        'normal'
      )

      documento.setFontSize(9)

      documento.text(
        'Subtotal',
        anchoPagina - 85,
        resumenInicio + 10
      )

      documento.text(
        formatearPrecio(subtotal),
        anchoPagina - 20,
        resumenInicio + 10,
        {
          align: 'right',
        }
      )

      documento.text(
        'Descuento',
        anchoPagina - 85,
        resumenInicio + 20
      )

      documento.text(
        formatearPrecio(descuento),
        anchoPagina - 20,
        resumenInicio + 20,
        {
          align: 'right',
        }
      )

      documento.text(
        'Impuestos',
        anchoPagina - 85,
        resumenInicio + 30
      )

      documento.text(
        formatearPrecio(impuesto),
        anchoPagina - 20,
        resumenInicio + 30,
        {
          align: 'right',
        }
      )

      documento.setDrawColor(
        210,
        215,
        220
      )

      documento.line(
        anchoPagina - 85,
        resumenInicio + 35,
        anchoPagina - 20,
        resumenInicio + 35
      )

      documento.setTextColor(
        20,
        30,
        45
      )

      documento.setFont(
        'helvetica',
        'bold'
      )

      documento.setFontSize(11)

      documento.text(
        'TOTAL',
        anchoPagina - 85,
        resumenInicio + 46
      )

      documento.text(
        formatearPrecio(total),
        anchoPagina - 20,
        resumenInicio + 46,
        {
          align: 'right',
        }
      )

      documento.setFillColor(
        8,
        17,
        31
      )

      documento.roundedRect(
        14,
        resumenInicio,
        105,
        54,
        3,
        3,
        'F'
      )

      documento.setTextColor(
        255,
        255,
        255
      )

      documento.setFont(
        'helvetica',
        'bold'
      )

      documento.setFontSize(10)

      documento.text(
        'INFORMACIÓN DE LA FACTURA',
        20,
        resumenInicio + 11
      )

      documento.setFont(
        'helvetica',
        'normal'
      )

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
        `Fecha de emisión: ${formatearFecha(
          fechaVenta
        )}`,
        20,
        resumenInicio + 37
      )

      documento.text(
        'Factura generada desde CellWorld.',
        20,
        resumenInicio + 46
      )

      documento.setTextColor(
        100,
        110,
        125
      )

      documento.setFont(
        'helvetica',
        'normal'
      )

      documento.setFontSize(7)

      documento.text(
        'CellWorld - Documento generado desde el sistema de gestión de ventas',
        14,
        altoPagina - 9
      )

      documento.text(
        'Página 1',
        anchoPagina - 14,
        altoPagina - 9,
        {
          align: 'right',
        }
      )

      const numeroArchivo =
        String(numeroFactura)
          .replace(
            /[^a-zA-Z0-9_-]/g,
            ''
          ) ||
        'venta'

      documento.save(
        `CellWorld_Factura_${numeroArchivo}.pdf`
      )
    } catch (error) {
      console.error(
        'Error al generar factura:',
        error
      )

      alert(
        'No se pudo generar la factura.'
      )
    }
  }

  /*
   * ============================================================
   * REPORTE PDF
   * ============================================================
   */

  const ventasReporte =
    Array.isArray(reporte?.ventas)
      ? reporte.ventas
      : Array.isArray(reporte?.detalle)
        ? reporte.detalle
        : Array.isArray(reporte?.pedidos)
          ? reporte.pedidos
          : []

  const ventasRealizadasReporte =
    Number(
      reporte?.ventas_realizadas ??
      reporte?.total_ventas ??
      ventasReporte.length
    ) || 0

  const unidadesVendidasReporte =
    Number(
      reporte?.unidades_vendidas ??
      reporte?.total_unidades ??
      ventasReporte.reduce(
        (total, venta) => {
          const productosVenta =
            obtenerProductosVenta(
              venta
            )

          return (
            total +
            productosVenta.reduce(
              (
                acumulado,
                producto
              ) =>
                acumulado +
                (Number(
                  producto?.cantidad
                ) || 0),
              0
            )
          )
        },
        0
      )
    ) || 0

  const totalVendidoReporte =
    Number(
      reporte?.total_vendido ??
      reporte?.total ??
      ventasReporte.reduce(
        (total, venta) =>
          total +
          (Number(venta?.total) || 0),
        0
      )
    ) || 0

  const exportarReportePDF = async () => {
    if (!reporte) {
      alert(
        'Primero consulta el reporte diario.'
      )
      return
    }

    try {
      const documento = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const anchoPagina =
        documento.internal.pageSize.getWidth()

      const altoPagina =
        documento.internal.pageSize.getHeight()

      documento.setFillColor(
        8,
        17,
        31
      )

      documento.rect(
        0,
        0,
        anchoPagina,
        38,
        'F'
      )

      try {
        const logoData =
          await convertirImagenDataURL(
            logoDark
          )

        documento.addImage(
          logoData,
          'PNG',
          14,
          7,
          32,
          20
        )
      } catch {
        documento.setFillColor(
          37,
          99,
          235
        )

        documento.roundedRect(
          14,
          8,
          30,
          18,
          3,
          3,
          'F'
        )

        documento.setTextColor(
          255,
          255,
          255
        )

        documento.setFontSize(11)

        documento.setFont(
          'helvetica',
          'bold'
        )

        documento.text(
          'CELLWORLD',
          17,
          19
        )
      }

      documento.setTextColor(
        255,
        255,
        255
      )

      documento.setFont(
        'helvetica',
        'bold'
      )

      documento.setFontSize(18)

      documento.text(
        'REPORTE DIARIO DE VENTAS',
        52,
        16
      )

      documento.setFont(
        'helvetica',
        'normal'
      )

      documento.setFontSize(9)

      documento.text(
        'Sistema de gestión de ventas - CellWorld',
        52,
        23
      )

      documento.text(
        `Fecha del reporte: ${formatearFechaCorta(
          fechaReporte
        )}`,
        52,
        29
      )

      const fechaGeneracion =
        new Date()

      documento.setTextColor(
        80,
        90,
        105
      )

      documento.setFontSize(9)

      documento.text(
        `Generado: ${fechaGeneracion.toLocaleString(
          'es-CO'
        )}`,
        anchoPagina - 14,
        46,
        {
          align: 'right',
        }
      )

      const resumenY = 53
      const tarjetaAncho = 82
      const tarjetaAlto = 23

      const tarjetas = [
        {
          x: 14,
          titulo: 'Ventas realizadas',
          valor:
            String(
              ventasRealizadasReporte
            ),
        },
        {
          x: 104,
          titulo: 'Unidades vendidas',
          valor:
            String(
              unidadesVendidasReporte
            ),
        },
        {
          x: 194,
          titulo: 'Total vendido',
          valor:
            formatearPrecio(
              totalVendidoReporte
            ),
        },
      ]

      tarjetas.forEach(
        (tarjeta) => {
          documento.setFillColor(
            245,
            247,
            250
          )

          documento.roundedRect(
            tarjeta.x,
            resumenY,
            tarjetaAncho,
            tarjetaAlto,
            3,
            3,
            'F'
          )

          documento.setTextColor(
            90,
            100,
            115
          )

          documento.setFont(
            'helvetica',
            'normal'
          )

          documento.setFontSize(8)

          documento.text(
            tarjeta.titulo,
            tarjeta.x + 6,
            resumenY + 8
          )

          documento.setTextColor(
            20,
            30,
            45
          )

          documento.setFont(
            'helvetica',
            'bold'
          )

          documento.setFontSize(12)

          documento.text(
            tarjeta.valor,
            tarjeta.x + 6,
            resumenY + 17
          )
        }
      )

      const filas =
        ventasReporte.map(
          (venta, indice) => {
            const productosVenta =
              obtenerProductosVenta(
                venta
              )

            const nombresProductos =
              productosVenta
                .map(
                  (producto) => {
                    const nombre =
                      obtenerNombreProducto(
                        producto
                      )

                    const cantidad =
                      Number(
                        producto?.cantidad
                      ) || 0

                    return `${nombre} x${cantidad}`
                  }
                )
                .join(', ')

            const fechaVenta =
              venta.fecha ||
              venta.creado_en

            return [
              venta.id_pedido ||
                venta.id ||
                indice + 1,
              obtenerNombreClienteVenta(
                venta
              ),
              formatearFecha(
                fechaVenta
              ),
              nombresProductos ||
                'Sin productos',
              venta.estado ||
                'Sin estado',
              formatearPrecio(
                venta.total
              ),
            ]
          }
        )

      autoTable(
        documento,
        {
          startY: 84,

          head: [
            [
              'N.º venta',
              'Cliente',
              'Fecha',
              'Productos',
              'Estado',
              'Total',
            ],
          ],

          body: filas,

          theme: 'grid',

          styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 3,
            textColor: [
              35,
              45,
              60,
            ],
          },

          headStyles: {
            fillColor: [
              37,
              99,
              235,
            ],
            textColor: [
              255,
              255,
              255,
            ],
            fontStyle: 'bold',
          },

          alternateRowStyles: {
            fillColor: [
              248,
              250,
              252,
            ],
          },

          columnStyles: {
            0: {
              cellWidth: 23,
            },
            1: {
              cellWidth: 42,
            },
            2: {
              cellWidth: 43,
            },
            3: {
              cellWidth: 85,
            },
            4: {
              cellWidth: 30,
            },
            5: {
              cellWidth: 35,
              halign: 'right',
            },
          },

          margin: {
            left: 14,
            right: 14,
          },
        }
      )

      const posicionFinal =
        documento.lastAutoTable?.finalY ||
        84

      documento.setFillColor(
        8,
        17,
        31
      )

      documento.roundedRect(
        14,
        posicionFinal + 8,
        anchoPagina - 28,
        15,
        3,
        3,
        'F'
      )

      documento.setTextColor(
        255,
        255,
        255
      )

      documento.setFont(
        'helvetica',
        'bold'
      )

      documento.setFontSize(10)

      documento.text(
        'TOTAL DEL REPORTE',
        20,
        posicionFinal + 17
      )

      documento.text(
        formatearPrecio(
          totalVendidoReporte
        ),
        anchoPagina - 20,
        posicionFinal + 17,
        {
          align: 'right',
        }
      )

      documento.setTextColor(
        100,
        110,
        125
      )

      documento.setFont(
        'helvetica',
        'normal'
      )

      documento.setFontSize(7)

      documento.text(
        'CellWorld - Reporte generado desde el sistema',
        14,
        altoPagina - 8
      )

      documento.text(
        'Página 1',
        anchoPagina - 14,
        altoPagina - 8,
        {
          align: 'right',
        }
      )

      const fechaArchivo =
        fechaReporte.replaceAll(
          '-',
          ''
        )

      documento.save(
        `CellWorld_Reporte_Diario_${fechaArchivo}.pdf`
      )
    } catch (error) {
      console.error(error)

      alert(
        'No se pudo generar el PDF.'
      )
    }
  }

  /*
   * ============================================================
   * REPORTE EXCEL
   * ============================================================
   */

  const exportarReporteExcel = () => {
    if (!reporte) {
      alert(
        'Primero consulta el reporte diario.'
      )
      return
    }

    try {
      const fechaGeneracion =
        new Date()

      const datosResumen = [
        ['CELLWORLD', ''],
        [
          'REPORTE DIARIO DE VENTAS',
          '',
        ],
        ['', ''],
        [
          'Fecha del reporte',
          fechaReporte,
        ],
        [
          'Fecha de generación',
          fechaGeneracion.toLocaleString(
            'es-CO'
          ),
        ],
        ['', ''],
        [
          'Ventas realizadas',
          ventasRealizadasReporte,
        ],
        [
          'Unidades vendidas',
          unidadesVendidasReporte,
        ],
        [
          'Total vendido (COP)',
          totalVendidoReporte,
        ],
      ]

      const hojaResumen =
        XLSX.utils.aoa_to_sheet(
          datosResumen
        )

      hojaResumen['!cols'] = [
        { wch: 30 },
        { wch: 32 },
      ]

      if (hojaResumen['B9']) {
        hojaResumen['B9'].z =
          '$#,##0'
      }

      const detalleVentas = []

      ventasReporte.forEach(
        (venta, indiceVenta) => {
          const productosVenta =
            obtenerProductosVenta(
              venta
            )

          const numeroVenta =
            venta.id_pedido ||
            venta.id ||
            indiceVenta + 1

          const cliente =
            obtenerNombreClienteVenta(
              venta
            )

          const fechaVenta =
            venta.fecha ||
            venta.creado_en ||
            ''

          const fechaFormateada =
            fechaVenta
              ? new Date(
                  fechaVenta
                ).toLocaleString(
                  'es-CO'
                )
              : ''

          const estado =
            venta.estado ||
            'Sin estado'

          if (
            productosVenta.length >
            0
          ) {
            productosVenta.forEach(
              (producto) => {
                const cantidad =
                  Number(
                    producto?.cantidad
                  ) || 0

                const precioUnitario =
                  obtenerPrecioProducto(
                    producto
                  )

                const subtotal =
                  cantidad *
                  precioUnitario

                detalleVentas.push({
                  'N.º venta':
                    numeroVenta,
                  Fecha:
                    fechaFormateada,
                  Cliente:
                    cliente,
                  Producto:
                    obtenerNombreProducto(
                      producto
                    ),
                  Cantidad:
                    cantidad,
                  'Precio unitario (COP)':
                    precioUnitario,
                  'Subtotal (COP)':
                    subtotal,
                  Estado:
                    estado,
                  'Total venta (COP)':
                    Number(
                      venta.total
                    ) || 0,
                })
              }
            )
          } else {
            detalleVentas.push({
              'N.º venta':
                numeroVenta,
              Fecha:
                fechaFormateada,
              Cliente:
                cliente,
              Producto:
                'Sin productos',
              Cantidad: 0,
              'Precio unitario (COP)':
                0,
              'Subtotal (COP)': 0,
              Estado:
                estado,
              'Total venta (COP)':
                Number(
                  venta.total
                ) || 0,
            })
          }
        }
      )

      const hojaVentas =
        XLSX.utils.json_to_sheet(
          detalleVentas
        )

      hojaVentas['!cols'] = [
        { wch: 12 },
        { wch: 23 },
        { wch: 28 },
        { wch: 34 },
        { wch: 12 },
        { wch: 22 },
        { wch: 20 },
        { wch: 16 },
        { wch: 20 },
      ]

      const rango =
        XLSX.utils.decode_range(
          hojaVentas['!ref'] ||
            'A1:I1'
        )

      for (
        let fila = 1;
        fila <= rango.e.r;
        fila++
      ) {
        const filaExcel =
          fila + 1

        const celdaPrecio =
          hojaVentas[
            `F${filaExcel}`
          ]

        const celdaSubtotal =
          hojaVentas[
            `G${filaExcel}`
          ]

        const celdaTotal =
          hojaVentas[
            `I${filaExcel}`
          ]

        if (celdaPrecio) {
          celdaPrecio.z =
            '$#,##0'
        }

        if (celdaSubtotal) {
          celdaSubtotal.z =
            '$#,##0'
        }

        if (celdaTotal) {
          celdaTotal.z =
            '$#,##0'
        }
      }

      if (hojaVentas['!ref']) {
        hojaVentas['!autofilter'] = {
          ref: hojaVentas['!ref'],
        }
      }

      hojaVentas['!freeze'] = {
        xSplit: 0,
        ySplit: 1,
      }

      const productosAnalisis = {}

      ventasReporte.forEach(
        (venta) => {
          const productosVenta =
            obtenerProductosVenta(
              venta
            )

          productosVenta.forEach(
            (producto) => {
              const nombre =
                obtenerNombreProducto(
                  producto
                )

              const cantidad =
                Number(
                  producto?.cantidad
                ) || 0

              const precio =
                obtenerPrecioProducto(
                  producto
                )

              if (
                !productosAnalisis[
                  nombre
                ]
              ) {
                productosAnalisis[
                  nombre
                ] = {
                  Producto:
                    nombre,
                  'Unidades vendidas':
                    0,
                  'Precio unitario promedio':
                    0,
                  'Total vendido (COP)':
                    0,
                }
              }

              productosAnalisis[
                nombre
              ][
                'Unidades vendidas'
              ] += cantidad

              productosAnalisis[
                nombre
              ][
                'Total vendido (COP)'
              ] +=
                cantidad * precio
            }
          )
        }
      )

      const datosProductos =
        Object.values(
          productosAnalisis
        )

      datosProductos.forEach(
        (producto) => {
          if (
            producto[
              'Unidades vendidas'
            ] > 0
          ) {
            producto[
              'Precio unitario promedio'
            ] =
              producto[
                'Total vendido (COP)'
              ] /
              producto[
                'Unidades vendidas'
              ]
          }
        }
      )

      const hojaProductos =
        XLSX.utils.json_to_sheet(
          datosProductos
        )

      hojaProductos['!cols'] = [
        { wch: 35 },
        { wch: 22 },
        { wch: 28 },
        { wch: 24 },
      ]

      if (hojaProductos['!ref']) {
        hojaProductos['!autofilter'] = {
          ref: hojaProductos['!ref'],
        }
      }

      hojaProductos['!freeze'] = {
        xSplit: 0,
        ySplit: 1,
      }

      if (hojaProductos['!ref']) {
        const rangoProductos =
          XLSX.utils.decode_range(
            hojaProductos['!ref']
          )

        for (
          let fila = 1;
          fila <= rangoProductos.e.r;
          fila++
        ) {
          const filaExcel =
            fila + 1

          const precioPromedio =
            hojaProductos[
              `C${filaExcel}`
            ]

          const totalProducto =
            hojaProductos[
              `D${filaExcel}`
            ]

          if (precioPromedio) {
            precioPromedio.z =
              '$#,##0'
          }

          if (totalProducto) {
            totalProducto.z =
              '$#,##0'
          }
        }
      }

      const libro =
        XLSX.utils.book_new()

      libro.Props = {
        Title:
          'Reporte Diario de Ventas - CellWorld',
        Subject:
          'Reporte diario de ventas',
        Author: 'CellWorld',
        Company: 'CellWorld',
        CreatedDate:
          new Date(),
      }

      XLSX.utils.book_append_sheet(
        libro,
        hojaResumen,
        'Resumen'
      )

      XLSX.utils.book_append_sheet(
        libro,
        hojaVentas,
        'Detalle de ventas'
      )

      XLSX.utils.book_append_sheet(
        libro,
        hojaProductos,
        'Análisis productos'
      )

      const fechaArchivo =
        fechaReporte.replaceAll(
          '-',
          ''
        )

      XLSX.writeFile(
        libro,
        `CellWorld_Reporte_Diario_${fechaArchivo}.xlsx`
      )
    } catch (error) {
      console.error(
        'Error al exportar Excel:',
        error
      )

      alert(
        'No se pudo generar el archivo Excel.'
      )
    }
  }

  /*
   * ============================================================
   * PAGINACIÓN
   * ============================================================
   */

  const usuariosPaginados = useMemo(() => {
    const inicio =
      (paginaUsuarios - 1) *
      elementosPorPagina

    return usuarios.slice(
      inicio,
      inicio + elementosPorPagina
    )
  }, [
    usuarios,
    paginaUsuarios,
  ])

  const productosPaginados = useMemo(() => {
    const inicio =
      (paginaProductos - 1) *
      elementosPorPagina

    return productos.slice(
      inicio,
      inicio + elementosPorPagina
    )
  }, [
    productos,
    paginaProductos,
  ])

  const ventasOrdenadas = useMemo(() => {
    return [...ventas].sort(
      (a, b) => {
        const fechaA = new Date(
          a.fecha ||
            a.creado_en ||
            0
        ).getTime()

        const fechaB = new Date(
          b.fecha ||
            b.creado_en ||
            0
        ).getTime()

        return fechaB - fechaA
      }
    )
  }, [ventas])

  const ventasPaginadas = useMemo(() => {
    const inicio =
      (paginaVentas - 1) *
      elementosPorPagina

    return ventasOrdenadas.slice(
      inicio,
      inicio + elementosPorPagina
    )
  }, [
    ventasOrdenadas,
    paginaVentas,
  ])

  const pqrsOrdenadas = useMemo(() => {
    return [...pqrs].sort((a, b) => {
      const fechaA = new Date(obtenerFechaPqr(a) || 0).getTime()
      const fechaB = new Date(obtenerFechaPqr(b) || 0).getTime()
      return fechaB - fechaA
    })
  }, [pqrs])

  const pqrsPaginadas = useMemo(() => {
    const inicio = (paginaPqrs - 1) * elementosPorPagina
    return pqrsOrdenadas.slice(inicio, inicio + elementosPorPagina)
  }, [pqrsOrdenadas, paginaPqrs])

  const reportePaginado = useMemo(() => {
    const inicio =
      (paginaReporte - 1) *
      elementosPorPagina

    return ventasReporte.slice(
      inicio,
      inicio + elementosPorPagina
    )
  }, [
    ventasReporte,
    paginaReporte,
  ])

  const totalPaginasUsuarios =
    Math.max(
      1,
      Math.ceil(
        usuarios.length /
          elementosPorPagina
      )
    )

  const totalPaginasProductos =
    Math.max(
      1,
      Math.ceil(
        productos.length /
          elementosPorPagina
      )
    )

  const totalPaginasVentas =
    Math.max(
      1,
      Math.ceil(
        ventasOrdenadas.length /
          elementosPorPagina
      )
    )

  const totalPaginasPqrs =
    Math.max(
      1,
      Math.ceil(pqrsOrdenadas.length / elementosPorPagina)
    )

  const totalPaginasReporte =
    Math.max(
      1,
      Math.ceil(
        ventasReporte.length /
          elementosPorPagina
      )
    )

  const BotonesPaginacion = ({
    pagina,
    totalPaginas,
    cambiarPagina,
  }) => {
    return (
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={pagina <= 1}
          onClick={() =>
            cambiarPagina(
              Math.max(
                1,
                pagina - 1
              )
            )
          }
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
            pagina <= 1
              ? 'cursor-not-allowed opacity-40'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          } ${tema.borde}`}
        >
          <ChevronLeft
            size={16}
          />
        </button>

        <span
          className={`min-w-[80px] text-center text-xs font-medium ${tema.textoSecundario}`}
        >
          Página {pagina} de{' '}
          {totalPaginas}
        </span>

        <button
          type="button"
          disabled={
            pagina >= totalPaginas
          }
          onClick={() =>
            cambiarPagina(
              Math.min(
                totalPaginas,
                pagina + 1
              )
            )
          }
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
            pagina >= totalPaginas
              ? 'cursor-not-allowed opacity-40'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          } ${tema.borde}`}
        >
          <ChevronRight
            size={16}
          />
        </button>
      </div>
    )
  }

  /*
   * ============================================================
   * ESTADÍSTICAS
   * ============================================================
   */

  const ventasTotales = ventas.length

  const totalVendido = ventas.reduce(
    (total, venta) =>
      total +
      (Number(venta?.total) || 0),
    0
  )

  const unidadesVendidas =
    ventas.reduce(
      (total, venta) => {
        return (
          total +
          obtenerProductosVenta(
            venta
          ).reduce(
            (
              acumulado,
              producto
            ) =>
              acumulado +
              (Number(
                producto?.cantidad
              ) || 0),
            0
          )
        )
      },
      0
    )

  const promedioVenta =
    ventasTotales > 0
      ? totalVendido /
        ventasTotales
      : 0

  const usuariosActivos =
    usuarios.filter(
      (item) =>
        Number(item.estado) ===
          1 ||
        item.estado === true
    ).length

  const stockTotal =
    productos.reduce(
      (total, producto) =>
        total +
        (Number(
          producto.stock ??
            producto.cantidad
        ) || 0),
      0
    )

  const administradores =
    usuarios.filter(
      (item) =>
        obtenerIdRolUsuario(
          item
        ) === 1
    ).length

  const clientes =
    usuarios.filter(
      (item) =>
        obtenerIdRolUsuario(
          item
        ) === 2
    ).length

  const empleados =
    usuarios.filter(
      (item) =>
        obtenerIdRolUsuario(
          item
        ) === 3
    ).length

  const productosStockBajo =
    productos.filter(
      (item) =>
        Number(
          item.stock ??
            item.cantidad
        ) <= 5
    ).length

  const productosDisponibles =
    productos.filter(
      (item) =>
        Number(
          item.stock ??
            item.cantidad
        ) > 5
    ).length

  const pqrsPendientes = pqrs.filter(esPqrPendiente).length

  const indicadoresDashboard =
    estadisticasDashboard?.indicadores || {}

  const ventasPorDiaDashboard =
    estadisticasDashboard?.ventas_por_dia || []

  const productosDashboard =
    estadisticasDashboard?.productos_mas_vendidos || []

  const maxVentaDashboard = Math.max(
    1,
    ...ventasPorDiaDashboard.map((item) => Number(item.total) || 0)
  )

  const maxProductoDashboard = Math.max(
    1,
    ...productosDashboard.map((item) => Number(item.unidades) || 0)
  )

  const puntosVentasDashboard = ventasPorDiaDashboard
    .map((item, indice) => {
      const x = ventasPorDiaDashboard.length > 1
        ? (indice / (ventasPorDiaDashboard.length - 1)) * 100
        : 50
      const y = 100 - ((Number(item.total) || 0) / maxVentaDashboard) * 90
      return `${x},${y}`
    })
    .join(' ')

  /*
   * ============================================================
   * ESTILOS DE COMPONENTES
   * ============================================================
   */

  const tarjetaKPI = `
    ${tema.panel}
    border
    rounded-2xl
    p-4
    shadow-sm
  `

  const botonPrincipal = `
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-blue-600
    px-4
    py-2
    text-sm
    font-semibold
    text-white
    transition
    hover:bg-blue-700
  `

  const botonSecundario = `
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-xl
    border
    px-4
    py-2
    text-sm
    font-semibold
    transition
    hover:bg-slate-100
    dark:hover:bg-slate-800
    ${tema.borde}
  `

  const tituloVista =
    vista === 'resumen'
      ? 'Resumen general'
      : vista === 'usuarios'
        ? 'Gestión de usuarios'
        : vista === 'productos'
          ? 'Gestión de productos'
          : vista === 'historial'
            ? 'Historial de ventas'
            : vista === 'pqrs'
              ? 'PQR'
              : 'Reporte diario de ventas'

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div
      className={`h-screen overflow-hidden ${tema.fondo} ${tema.texto}`}
    >
      <div className="flex h-full">
        {/* SIDEBAR */}
        <aside
          className={`flex w-[245px] shrink-0 flex-col ${tema.panel}`}
        >
          <div className="flex h-[78px] items-center justify-center px-5">
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

          <div className="px-4 py-5">
            <div
              className={`mb-5 rounded-2xl border p-3 ${tema.panelSecundario}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <ShieldCheck
                    size={20}
                  />
                </div>

                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-bold ${tema.texto}`}
                  >
                    {obtenerNombreUsuario(
                      usuario
                    )}
                  </p>

                  <p
                    className={`text-xs ${tema.textoSecundario}`}
                  >
                    Administrador
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() =>
                  cambiarVista(
                    'resumen'
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  vista === 'resumen'
                    ? 'bg-blue-600 text-white'
                    : `${tema.textoSecundario}`
                }`}
              >
                <BarChart3
                  size={18}
                />
                Resumen
              </button>

              <button
                type="button"
                onClick={() =>
                  cambiarVista(
                    'usuarios'
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  vista === 'usuarios'
                    ? 'bg-blue-600 text-white'
                    : `${tema.textoSecundario}`
                }`}
              >
                <Users
                  size={18}
                />
                Usuarios
              </button>

              <button
                type="button"
                onClick={() =>
                  cambiarVista(
                    'productos'
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  vista === 'productos'
                    ? 'bg-blue-600 text-white'
                    : `${tema.textoSecundario}`
                }`}
              >
                <Package
                  size={18}
                />
                Productos
              </button>

              <button
                type="button"
                onClick={() =>
                  cambiarVista(
                    'historial'
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  vista === 'historial'
                    ? 'bg-blue-600 text-white'
                    : `${tema.textoSecundario}`
                }`}
              >
                <ShoppingBag
                  size={18}
                />
                Historial de ventas
              </button>

              <button
                type="button"
                onClick={() =>
                  cambiarVista(
                    'reporte'
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  vista === 'reporte'
                    ? 'bg-blue-600 text-white'
                    : `${tema.textoSecundario}`
                }`}
              >
                <FileText
                  size={18}
                />
                Reporte diario
              </button>

              <button
                type="button"
                onClick={() => cambiarVista('pqrs')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  vista === 'pqrs'
                    ? 'bg-blue-600 text-white'
                    : tema.textoSecundario
                }`}
              >
                <ClipboardList size={18} />
                PQR
              </button>
            </nav>
          </div>

          <div className="mt-auto p-4">
            <button
              type="button"
              onClick={() =>
                navigate('/')
              }
              className={`flex w-full items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${tema.borde}`}
            >
              Volver a la tienda
            </button>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            {/* HEADER */}
            <header
              className={`flex h-[78px] shrink-0 items-center justify-between border-b px-7 ${tema.panel} ${tema.borde}`}
            >
              <div>
                <h1 className="text-xl font-bold">
                  {tituloVista}
                </h1>

                <p
                  className={`mt-0.5 text-xs ${tema.textoSecundario}`}
                >
                  Panel de administración
                  de CellWorld
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    cargarUsuarios()
                    cargarProductos()
                    cargarVentas()
                    cargarPqrs()

                    if (
                      vista ===
                      'reporte'
                    ) {
                      cargarReporte(
                        fechaReporte
                      )
                    }
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition hover:bg-slate-100 dark:hover:bg-slate-800 ${tema.borde}`}
                  title="Actualizar"
                >
                  <RefreshCw
                    size={17}
                    className={
                      cargandoUsuarios ||
                      cargandoProductos ||
                      cargandoVentas ||
                      cargandoPqrs
                        ? 'animate-spin'
                        : ''
                    }
                  />
                </button>

                <div
                  className={`hidden rounded-xl border px-3 py-2 text-xs font-semibold sm:block ${tema.borde} ${tema.panelSecundario}`}
                >
                  Administrador
                </div>
              </div>
            </header>

            {/* VISTA */}
            <div className="min-h-0 flex-1 overflow-hidden p-5">
              {/* ==================================================
                  RESUMEN
              ================================================== */}
              {vista ===
                'resumen' && (
                <div className="flex h-full flex-col gap-4 overflow-hidden">
                  <div className="grid grid-cols-4 gap-4">
                    <div
                      className={tarjetaKPI}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-xs font-medium ${tema.textoSecundario}`}
                          >
                            Total ventas
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {ventasTotales}
                          </p>
                        </div>

                        <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                          <ShoppingBag
                            size={19}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={tarjetaKPI}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-xs font-medium ${tema.textoSecundario}`}
                          >
                            Total vendido
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            {formatearPrecio(
                              totalVendido
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                          <DollarSign
                            size={19}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={tarjetaKPI}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-xs font-medium ${tema.textoSecundario}`}
                          >
                            Unidades vendidas
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {unidadesVendidas}
                          </p>
                        </div>

                        <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                          <Boxes
                            size={19}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={tarjetaKPI}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-xs font-medium ${tema.textoSecundario}`}
                          >
                            Promedio por venta
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            {formatearPrecio(
                              promedioVenta
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                          <TrendingUp
                            size={19}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-4">
                    <div
                      className={tarjetaKPI}
                    >
                      <p
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        Usuarios registrados
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {usuarios.length}
                      </p>
                    </div>

                    <div
                      className={tarjetaKPI}
                    >
                      <p
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        Usuarios activos
                      </p>

                      <p className="mt-1 text-2xl font-bold text-emerald-500">
                        {usuariosActivos}
                      </p>
                    </div>

                    <div
                      className={tarjetaKPI}
                    >
                      <p
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        Productos
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {productos.length}
                      </p>
                    </div>

                    <div
                      className={tarjetaKPI}
                    >
                      <p
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        Stock total
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {stockTotal}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => cambiarVista('pqrs')}
                      className={`${tarjetaKPI} text-left transition hover:border-blue-400`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs ${tema.textoSecundario}`}>
                            PQR recibidas
                          </p>
                          <p className="mt-1 text-2xl font-bold">
                            {pqrs.length}
                          </p>
                        </div>
                        <ClipboardList size={19} className="text-blue-500" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => cambiarVista('pqrs')}
                      className={`${tarjetaKPI} text-left transition hover:border-amber-400`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs ${tema.textoSecundario}`}>
                            PQR pendientes
                          </p>
                          <p className="mt-1 text-2xl font-bold text-amber-500">
                            {pqrsPendientes}
                          </p>
                        </div>
                        <MessageSquareWarning size={19} className="text-amber-500" />
                      </div>
                    </button>
                  </div>

                  <div className={`rounded-2xl border p-4 shadow-sm ${tema.panel}`}>
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h2 className="font-bold">Análisis de ventas</h2>
                        <p className={`text-xs ${tema.textoSecundario}`}>
                          Información consolidada desde FastAPI
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={cargarEstadisticasDashboard}
                        disabled={cargandoEstadisticas}
                        className={`${botonPrincipal} ${cargandoEstadisticas ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        <RefreshCw size={15} className={cargandoEstadisticas ? 'animate-spin' : ''} />
                        Aplicar filtros
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-5">
                      <input
                        type="date"
                        value={filtrosDashboard.fecha_inicio}
                        onChange={(event) => setFiltrosDashboard((actual) => ({ ...actual, fecha_inicio: event.target.value }))}
                        className={`rounded-xl border px-3 py-2 text-xs outline-none focus:border-blue-500 ${tema.input}`}
                        aria-label="Fecha inicial"
                      />
                      <input
                        type="date"
                        value={filtrosDashboard.fecha_fin}
                        onChange={(event) => setFiltrosDashboard((actual) => ({ ...actual, fecha_fin: event.target.value }))}
                        className={`rounded-xl border px-3 py-2 text-xs outline-none focus:border-blue-500 ${tema.input}`}
                        aria-label="Fecha final"
                      />
                      <input
                        type="text"
                        value={filtrosDashboard.producto}
                        onChange={(event) => setFiltrosDashboard((actual) => ({ ...actual, producto: event.target.value }))}
                        placeholder="Producto"
                        className={`rounded-xl border px-3 py-2 text-xs outline-none focus:border-blue-500 ${tema.input}`}
                      />
                      <select
                        value={filtrosDashboard.estado}
                        onChange={(event) => setFiltrosDashboard((actual) => ({ ...actual, estado: event.target.value }))}
                        className={`rounded-xl border px-3 py-2 text-xs outline-none focus:border-blue-500 ${tema.input}`}
                        aria-label="Estado de venta"
                      >
                        <option value="">Todos los estados</option>
                        <option value="pagado">Pagado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                      <select
                        value={filtrosDashboard.cliente_id}
                        onChange={(event) => setFiltrosDashboard((actual) => ({ ...actual, cliente_id: event.target.value }))}
                        className={`rounded-xl border px-3 py-2 text-xs outline-none focus:border-blue-500 ${tema.input}`}
                        aria-label="Cliente"
                      >
                        <option value="">Todos los clientes</option>
                        {usuarios
                          .filter((item) => obtenerIdRolUsuario(item) === 2)
                          .map((item) => (
                            <option key={item.id_usuario} value={item.id_usuario}>
                              {obtenerNombreUsuario(item)}
                            </option>
                          ))}
                      </select>
                    </div>

                    {errorEstadisticas ? (
                      <p className="mt-3 text-sm text-red-500">{errorEstadisticas}</p>
                    ) : (
                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        <div className={`rounded-xl border p-3 ${tema.panelSecundario} ${tema.borde}`}>
                          <p className={`mb-2 text-xs font-semibold ${tema.textoSecundario}`}>Ventas por día</p>
                          <div className="relative h-56 overflow-hidden rounded-lg border border-slate-200/60 bg-white/50 p-3 dark:border-slate-700/60 dark:bg-slate-950/30">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full">
                              <polyline
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="2"
                                points={puntosVentasDashboard || '0,100 100,100'}
                              />
                            </svg>
                            <div className="flex justify-between gap-2 overflow-hidden text-[10px] text-slate-500">
                              {ventasPorDiaDashboard.slice(-6).map((item) => (
                                <span key={item.fecha} className="truncate">{item.fecha}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className={`rounded-xl border p-3 ${tema.panelSecundario} ${tema.borde}`}>
                          <p className={`mb-2 text-xs font-semibold ${tema.textoSecundario}`}>Productos más vendidos</p>
                          <div className="flex h-56 flex-col justify-center gap-2">
                            {productosDashboard.slice(0, 6).map((item) => (
                              <div key={item.producto} className="grid grid-cols-[90px_1fr_35px] items-center gap-2 text-[10px]">
                                <span className="truncate" title={item.producto}>{item.producto}</span>
                                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                  <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{ width: `${((Number(item.unidades) || 0) / maxProductoDashboard) * 100}%` }}
                                  />
                                </div>
                                <span className="text-right font-semibold">{item.unidades}</span>
                              </div>
                            ))}
                            {productosDashboard.length === 0 && (
                              <p className={`text-center text-xs ${tema.textoSecundario}`}>Sin ventas para mostrar.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className={`rounded-xl border p-3 ${tema.panelSecundario} ${tema.borde}`}>
                        <p className={`text-xs ${tema.textoSecundario}`}>Ventas filtradas</p>
                        <p className="mt-1 text-xl font-bold">{indicadoresDashboard.ventas ?? ventas.length}</p>
                      </div>
                      <div className={`rounded-xl border p-3 ${tema.panelSecundario} ${tema.borde}`}>
                        <p className={`text-xs ${tema.textoSecundario}`}>Total facturado</p>
                        <p className="mt-1 text-xl font-bold">{formatearPrecio(indicadoresDashboard.total_facturado ?? totalVendido)}</p>
                      </div>
                      <div className={`rounded-xl border p-3 ${tema.panelSecundario} ${tema.borde}`}>
                        <p className={`text-xs ${tema.textoSecundario}`}>PQR pendientes</p>
                        <p className="mt-1 text-xl font-bold text-amber-500">{indicadoresDashboard.pqr_pendientes ?? pqrsPendientes}</p>
                      </div>
                      <div className={`rounded-xl border p-3 ${tema.panelSecundario} ${tema.borde}`}>
                        <p className={`text-xs ${tema.textoSecundario}`}>PQR recibidas</p>
                        <p className="mt-1 text-xl font-bold">{indicadoresDashboard.pqr_recibidas ?? pqrs.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
                    <div
                      className={`min-h-0 rounded-2xl border p-4 shadow-sm ${tema.panel}`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h2 className="font-bold">
                            Distribución de usuarios
                          </h2>

                          <p
                            className={`text-xs ${tema.textoSecundario}`}
                          >
                            Usuarios por rol
                          </p>
                        </div>

                        <Users
                          size={19}
                          className="text-blue-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${tema.textoSecundario}`}
                          >
                            Administradores
                          </span>

                          <span className="font-bold">
                            {administradores}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${usuarios.length ? (administradores / usuarios.length) * 100 : 0}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${tema.textoSecundario}`}
                          >
                            Clientes
                          </span>

                          <span className="font-bold">
                            {clientes}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${usuarios.length ? (clientes / usuarios.length) * 100 : 0}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${tema.textoSecundario}`}
                          >
                            Empleados
                          </span>

                          <span className="font-bold">
                            {empleados}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-violet-500"
                            style={{ width: `${usuarios.length ? (empleados / usuarios.length) * 100 : 0}%` }}
                          />
                        </div>

                      </div>
                    </div>

                    <div
                      className={`min-h-0 rounded-2xl border p-4 shadow-sm ${tema.panel}`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h2 className="font-bold">
                            Estado del inventario
                          </h2>

                          <p
                            className={`text-xs ${tema.textoSecundario}`}
                          >
                            Disponibilidad actual
                          </p>
                        </div>

                        <Package
                          size={19}
                          className="text-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`rounded-xl border p-4 ${tema.panelSecundario} ${tema.borde}`}
                        >
                          <div className="flex items-center gap-2">
                            <Ban
                              size={18}
                              className="text-red-500"
                            />

                            <span
                              className={`text-xs ${tema.textoSecundario}`}
                            >
                              Stock bajo
                            </span>
                          </div>

                          <p className="mt-2 text-2xl font-bold">
                            {
                              productosStockBajo
                            }
                          </p>
                        </div>

                        <div
                          className={`rounded-xl border p-4 ${tema.panelSecundario} ${tema.borde}`}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle
                              size={18}
                              className="text-emerald-500"
                            />

                            <span
                              className={`text-xs ${tema.textoSecundario}`}
                            >
                              Disponibles
                            </span>
                          </div>

                          <p className="mt-2 text-2xl font-bold">
                            {
                              productosDisponibles
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border shadow-sm ${tema.panel}`}
                  >
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <div>
                        <h2 className="text-sm font-bold">
                          Ventas recientes
                        </h2>

                        <p
                          className={`text-xs ${tema.textoSecundario}`}
                        >
                          Últimas operaciones registradas
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          cambiarVista(
                            'historial'
                          )
                        }
                        className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                      >
                        Ver historial
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 px-4 py-3 text-xs font-semibold">
                      <span>Venta</span>
                      <span>Cliente</span>
                      <span>Fecha</span>
                      <span className="text-right">
                        Total
                      </span>
                    </div>

                    {ventasOrdenadas
                      .slice(0, 3)
                      .map(
                        (
                          venta,
                          indice
                        ) => (
                          <div
                            key={
                              venta.id_pedido ||
                              venta.id ||
                              indice
                            }
                            className={`grid grid-cols-4 gap-4 border-t px-4 py-3 text-xs ${tema.borde}`}
                          >
                            <span>
                              #
                              {venta.id_pedido ||
                                venta.id ||
                                indice +
                                  1}
                            </span>

                            <span className="truncate">
                              {obtenerNombreClienteVenta(
                                venta
                              )}
                            </span>

                            <span
                              className={
                                tema.textoSecundario
                              }
                            >
                              {formatearFecha(
                                venta.fecha ||
                                  venta.creado_en
                              )}
                            </span>

                            <span className="text-right font-semibold">
                              {formatearPrecio(
                                venta.total
                              )}
                            </span>
                          </div>
                        )
                      )}
                  </div>
                </div>
              )}

              {/* ==================================================
                  USUARIOS
              ================================================== */}
              {vista === 'pqrs' && (
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">PQR</h2>
                      <p className={`text-xs ${tema.textoSecundario}`}>
                        Peticiones, quejas y reclamos recibidos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${tema.panelSecundario} ${tema.borde}`}>
                        Recibidas: {pqrs.length}
                      </div>
                      <div className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                        Pendientes: {pqrsPendientes}
                      </div>
                    </div>
                  </div>

                  <div className={`min-h-0 flex-1 overflow-hidden rounded-2xl border shadow-sm ${tema.panel}`}>
                    <div className="grid grid-cols-[80px_1fr_1.2fr_120px_130px_90px] gap-3 border-b px-4 py-3 text-xs font-bold">
                      <span>Radicado</span>
                      <span>Cliente</span>
                      <span>Asunto</span>
                      <span>Fecha</span>
                      <span>Estado</span>
                      <span className="text-right">Acción</span>
                    </div>

                    {cargandoPqrs ? (
                      <div className="flex h-48 items-center justify-center">
                        <RefreshCw size={22} className="animate-spin text-blue-500" />
                      </div>
                    ) : errorPqrs ? (
                      <div className="flex h-48 flex-col items-center justify-center gap-2 px-5 text-center">
                        <MessageSquareWarning size={22} className="text-amber-500" />
                        <p className={`text-sm ${tema.textoSecundario}`}>{errorPqrs}</p>
                        <button type="button" onClick={cargarPqrs} className={botonSecundario}>
                          Reintentar
                        </button>
                      </div>
                    ) : pqrsPaginadas.length === 0 ? (
                      <div className={`flex h-48 items-center justify-center text-sm ${tema.textoSecundario}`}>
                        No hay PQR registradas.
                      </div>
                    ) : (
                      pqrsPaginadas.map((pqr, indice) => {
                        const pendiente = esPqrPendiente(pqr)
                        return (
                          <div
                            key={obtenerIdPqr(pqr, indice)}
                            className={`grid grid-cols-[80px_1fr_1.2fr_120px_130px_90px] items-center gap-3 border-b px-4 py-3 text-xs last:border-b-0 ${tema.borde}`}
                          >
                            <span className="font-semibold">#{obtenerIdPqr(pqr, indice + 1)}</span>
                            <span className="truncate">{obtenerTextoPqr(obtenerNombreClientePqr(pqr), 'Cliente')}</span>
                            <span className="truncate" title={obtenerTextoPqr(obtenerAsuntoPqr(pqr), 'Sin asunto')}>{obtenerTextoPqr(obtenerAsuntoPqr(pqr), 'Sin asunto')}</span>
                            <span className={tema.textoSecundario}>{formatearFecha(obtenerFechaPqr(pqr))}</span>
                            <span className={`w-fit rounded-full px-2.5 py-1 font-semibold ${pendiente ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'}`}>
                              {obtenerEstadoPqr(pqr)}
                            </span>
                            <button
                              type="button"
                              onClick={() => abrirResponderPqr(pqr)}
                              className="justify-self-end rounded-lg px-2 py-1.5 font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            >
                              Responder
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {!cargandoPqrs && !errorPqrs && pqrs.length > 0 && (
                    <div className="mt-4">
                      <BotonesPaginacion
                        pagina={paginaPqrs}
                        totalPaginas={totalPaginasPqrs}
                        cambiarPagina={setPaginaPqrs}
                      />
                    </div>
                  )}
                </div>
              )}

              {vista ===
                'usuarios' && (
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">
                        Usuarios
                      </h2>

                      <p
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        Administración de cuentas
                        y permisos
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        abrirNuevoUsuario
                      }
                      className={botonPrincipal}
                    >
                      <Plus
                        size={17}
                      />
                      Nuevo usuario
                    </button>
                  </div>

                  <div
                    className={`min-h-0 flex-1 overflow-hidden rounded-2xl border shadow-sm ${tema.panel}`}
                  >
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_120px] gap-3 border-b px-4 py-3 text-xs font-bold">
                      <span>Usuario</span>
                      <span>Documento</span>
                      <span>Rol</span>
                      <span>Estado</span>
                      <span className="text-right">
                        Acciones
                      </span>
                    </div>

                    {cargandoUsuarios ? (
                      <div className="flex h-48 items-center justify-center">
                        <RefreshCw
                          size={22}
                          className="animate-spin text-blue-500"
                        />
                      </div>
                    ) : errorUsuarios ? (
                      <div className="flex h-48 items-center justify-center px-5 text-sm text-red-500">
                        {errorUsuarios}
                      </div>
                    ) : usuariosPaginados.length ===
                      0 ? (
                      <div
                        className={`flex h-48 items-center justify-center text-sm ${tema.textoSecundario}`}
                      >
                        No hay usuarios
                        registrados.
                      </div>
                    ) : (
                      <div>
                        {usuariosPaginados.map(
                          (
                            item,
                            indice
                          ) => {
                            const activo =
                              Number(
                                item.estado
                              ) ===
                                1 ||
                              item.estado ===
                                true

                            return (
                              <div
                                key={
                                  item.id_usuario ||
                                  indice
                                }
                                className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_120px] items-center gap-3 border-b px-4 py-3 text-xs last:border-b-0 ${tema.borde}`}
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-semibold">
                                    {obtenerNombreUsuario(
                                      item
                                    )}
                                  </p>

                                  <p
                                    className={`truncate ${tema.textoSecundario}`}
                                  >
                                    {
                                      item.email
                                    }
                                  </p>
                                </div>

                                <span>
                                  {item.tipo_documento ||
                                    'CC'}{' '}
                                  {item.numero_documento ||
                                    '—'}
                                </span>

                                <span>
                                  {obtenerNombreRolUsuario(
                                    item
                                  )}
                                </span>

                                <span
                                  className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 font-semibold ${
                                    activo
                                      ? (modoOscuro
                                        ? 'bg-emerald-950 text-emerald-300'
                                        : 'bg-emerald-100 text-emerald-700')
                                      : (modoOscuro
                                        ? 'bg-red-950 text-red-300'
                                        : 'bg-red-100 text-red-700')
                                  }`}
                                >
                                  {activo ? (
                                    <>
                                      <UserCheck
                                        size={
                                          13
                                        }
                                      />
                                      Activo
                                    </>
                                  ) : (
                                    <>
                                      <UserX
                                        size={
                                          13
                                        }
                                      />
                                      Inactivo
                                    </>
                                  )}
                                </span>

                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirEditarUsuario(
                                        item
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-500 transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    title="Editar"
                                  >
                                    <Pencil
                                      size={
                                        15
                                      }
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      cambiarEstadoUsuario(
                                        item
                                      )
                                    }
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                      activo
                                        ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                        : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                    }`}
                                    title={
                                      activo
                                        ? 'Inactivar'
                                        : 'Activar'
                                    }
                                  >
                                    {activo ? (
                                      <Ban
                                        size={
                                          15
                                        }
                                      />
                                    ) : (
                                      <CheckCircle
                                        size={
                                          15
                                        }
                                      />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      eliminarUsuario(
                                        item
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                                    title="Eliminar"
                                  >
                                    <Trash2
                                      size={
                                        15
                                      }
                                    />
                                  </button>
                                </div>
                              </div>
                            )
                          }
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <span
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        {usuarios.length}{' '}
                        usuarios
                      </span>

                      <BotonesPaginacion
                        pagina={
                          paginaUsuarios
                        }
                        totalPaginas={
                          totalPaginasUsuarios
                        }
                        cambiarPagina={
                          setPaginaUsuarios
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  PRODUCTOS
              ================================================== */}
              {vista ===
                'productos' && (
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">
                        Productos
                      </h2>

                      <p
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        Administración del catálogo
                        e inventario
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        abrirNuevoProducto
                      }
                      className={botonPrincipal}
                    >
                      <Plus
                        size={17}
                      />
                      Nuevo producto
                    </button>
                  </div>

                  <div
                    className={`min-h-0 flex-1 overflow-hidden rounded-2xl border shadow-sm ${tema.panel}`}
                  >
                    <div className="grid grid-cols-[1.5fr_1fr_120px_120px_100px] gap-3 border-b px-4 py-3 text-xs font-bold">
                      <span>Producto</span>
                      <span>Categoría</span>
                      <span>Precio</span>
                      <span>Stock</span>
                      <span className="text-right">
                        Acciones
                      </span>
                    </div>

                    {cargandoProductos ? (
                      <div className="flex h-48 items-center justify-center">
                        <RefreshCw
                          size={22}
                          className="animate-spin text-blue-500"
                        />
                      </div>
                    ) : errorProductos ? (
                      <div className="flex h-48 items-center justify-center px-5 text-sm text-red-500">
                        {errorProductos}
                      </div>
                    ) : productosPaginados.length ===
                      0 ? (
                      <div
                        className={`flex h-48 items-center justify-center text-sm ${tema.textoSecundario}`}
                      >
                        No hay productos
                        registrados.
                      </div>
                    ) : (
                      <div>
                        {productosPaginados.map(
                          (
                            producto,
                            indice
                          ) => {
                            const stock =
                              Number(
                                producto.stock ??
                                  producto.cantidad
                              ) || 0

                            return (
                              <div
                                key={
                                  producto.id_producto ||
                                  producto.id ||
                                  indice
                                }
                                className={`grid grid-cols-[1.5fr_1fr_120px_120px_100px] items-center gap-3 border-b px-4 py-3 text-xs last:border-b-0 ${tema.borde}`}
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-semibold">
                                    {obtenerNombreProducto(
                                      producto
                                    )}
                                  </p>

                                  <p
                                    className={`truncate ${tema.textoSecundario}`}
                                  >
                                    {producto.descripcion ||
                                      'Sin descripción'}
                                  </p>
                                </div>

                                <span>
                                  {producto.categoria ||
                                    'Sin categoría'}
                                </span>

                                <span className="font-semibold">
                                  {formatearPrecio(
                                    producto.precio ??
                                      producto.precio_unitario
                                  )}
                                </span>

                                <span
                                  className={`font-semibold ${
                                    stock <=
                                    5
                                      ? 'text-red-500'
                                      : 'text-emerald-500'
                                  }`}
                                >
                                  {stock}
                                </span>

                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirEditarProducto(
                                        producto
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-500 transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    title="Editar"
                                  >
                                    <Pencil
                                      size={
                                        15
                                      }
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      eliminarProducto(
                                        producto
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                                    title="Eliminar"
                                  >
                                    <Trash2
                                      size={
                                        15
                                      }
                                    />
                                  </button>
                                </div>
                              </div>
                            )
                          }
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <span
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        {productos.length}{' '}
                        productos
                      </span>

                      <BotonesPaginacion
                        pagina={
                          paginaProductos
                        }
                        totalPaginas={
                          totalPaginasProductos
                        }
                        cambiarPagina={
                          setPaginaProductos
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  HISTORIAL DE VENTAS
              ================================================== */}
              {vista ===
                'historial' && (
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">
                        Historial de ventas
                      </h2>

                      <p
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        Operaciones comerciales
                        registradas
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        cargarVentas
                      }
                      className={botonSecundario}
                    >
                      <RefreshCw
                        size={16}
                        className={
                          cargandoVentas
                            ? 'animate-spin'
                            : ''
                        }
                      />
                      Actualizar
                    </button>
                  </div>

                  <div
                    className={`min-h-0 flex-1 overflow-hidden rounded-2xl border shadow-sm ${tema.panel}`}
                  >
                    <div className="grid grid-cols-[80px_1.2fr_1.2fr_120px_110px_125px] gap-3 border-b px-4 py-3 text-xs font-bold">
                      <span>N.º</span>
                      <span>Cliente</span>
                      <span>Fecha</span>
                      <span>Estado</span>
                      <span>Total</span>
                      <span className="text-right">
                        Factura
                      </span>
                    </div>

                    {cargandoVentas ? (
                      <div className="flex h-48 items-center justify-center">
                        <RefreshCw
                          size={22}
                          className="animate-spin text-blue-500"
                        />
                      </div>
                    ) : errorVentas ? (
                      <div className="flex h-48 items-center justify-center px-5 text-sm text-red-500">
                        {errorVentas}
                      </div>
                    ) : ventasPaginadas.length ===
                      0 ? (
                      <div
                        className={`flex h-48 items-center justify-center text-sm ${tema.textoSecundario}`}
                      >
                        No hay ventas
                        registradas.
                      </div>
                    ) : (
                      <div>
                        {ventasPaginadas.map(
                          (
                            venta,
                            indice
                          ) => (
                            <div
                              key={
                                venta.id_pedido ||
                                venta.id ||
                                indice
                              }
                              className={`grid grid-cols-[80px_1.2fr_1.2fr_120px_110px_125px] items-center gap-3 border-b px-4 py-3 text-xs last:border-b-0 ${tema.borde}`}
                            >
                              <span className="font-semibold">
                                #
                                {venta.id_pedido ||
                                  venta.id ||
                                  indice +
                                    1}
                              </span>

                              <span className="truncate">
                                {obtenerNombreClienteVenta(
                                  venta
                                )}
                              </span>

                              <span
                                className={
                                  tema.textoSecundario
                                }
                              >
                                {formatearFecha(
                                  venta.fecha ||
                                    venta.creado_en
                                )}
                              </span>

                              <span className="inline-flex w-fit rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                {venta.estado ||
                                  'Sin estado'}
                              </span>

                              <span className="font-bold">
                                {formatearPrecio(
                                  venta.total
                                )}
                              </span>

                              {/* FACTURA */}
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    generarFacturaPDF(
                                      venta
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                  title="Generar factura"
                                >
                                  <FileText
                                    size={
                                      14
                                    }
                                  />
                                  Factura
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <span
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        {ventas.length}{' '}
                        ventas
                      </span>

                      <BotonesPaginacion
                        pagina={
                          paginaVentas
                        }
                        totalPaginas={
                          totalPaginasVentas
                        }
                        cambiarPagina={
                          setPaginaVentas
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  REPORTE DIARIO
              ================================================== */}
              {vista ===
                'reporte' && (
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">
                        Reporte diario de ventas
                      </h2>

                      <p
                        className={`text-xs ${tema.textoSecundario}`}
                      >
                        Consulta y exportación del
                        reporte
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${tema.panel} ${tema.borde}`}
                      >
                        <CalendarDays
                          size={16}
                          className={
                            tema.textoSecundario
                          }
                        />

                        <input
                          type="date"
                          value={
                            fechaReporte
                          }
                          onChange={(event) =>
                            setFechaReporte(
                              event.target
                                .value
                            )
                          }
                          className={`bg-transparent text-sm outline-none ${tema.texto}`}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          cargarReporte(
                            fechaReporte
                          )
                        }
                        className={botonPrincipal}
                      >
                        <Search
                          size={16}
                        />
                        Consultar
                      </button>

                      <button
                        type="button"
                        disabled={
                          !reporte
                        }
                        onClick={
                          exportarReportePDF
                        }
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                          !reporte
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        } ${tema.borde}`}
                      >
                        <FileText
                          size={16}
                        />
                        PDF
                      </button>

                      <button
                        type="button"
                        disabled={
                          !reporte
                        }
                        onClick={
                          exportarReporteExcel
                        }
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                          !reporte
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        } ${tema.borde}`}
                      >
                        <FileSpreadsheet
                          size={16}
                        />
                        Excel
                      </button>
                    </div>
                  </div>

                  {cargandoReporte ? (
                    <div
                      className={`flex flex-1 items-center justify-center rounded-2xl border ${tema.panel} ${tema.borde}`}
                    >
                      <RefreshCw
                        size={25}
                        className="animate-spin text-blue-500"
                      />
                    </div>
                  ) : errorReporte ? (
                    <div
                      className={`flex flex-1 items-center justify-center rounded-2xl border text-sm text-red-500 ${tema.panel} ${tema.borde}`}
                    >
                      {errorReporte}
                    </div>
                  ) : !reporte ? (
                    <div
                      className={`flex flex-1 flex-col items-center justify-center rounded-2xl border ${tema.panel} ${tema.borde}`}
                    >
                      <CalendarDays
                        size={38}
                        className="mb-3 text-blue-500"
                      />

                      <p className="font-semibold">
                        Consulta un reporte
                      </p>

                      <p
                        className={`mt-1 text-xs ${tema.textoSecundario}`}
                      >
                        Selecciona una fecha y
                        presiona Consultar.
                      </p>
                    </div>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                      <div className="grid grid-cols-3 gap-4">
                        <div
                          className={tarjetaKPI}
                        >
                          <p
                            className={`text-xs ${tema.textoSecundario}`}
                          >
                            Ventas realizadas
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {
                              ventasRealizadasReporte
                            }
                          </p>
                        </div>

                        <div
                          className={tarjetaKPI}
                        >
                          <p
                            className={`text-xs ${tema.textoSecundario}`}
                          >
                            Unidades vendidas
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {
                              unidadesVendidasReporte
                            }
                          </p>
                        </div>

                        <div
                          className={tarjetaKPI}
                        >
                          <p
                            className={`text-xs ${tema.textoSecundario}`}
                          >
                            Total vendido
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {formatearPrecio(
                              totalVendidoReporte
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`min-h-0 flex-1 overflow-hidden rounded-2xl border shadow-sm ${tema.panel}`}
                      >
                        <div className="flex items-center justify-between border-b px-4 py-3">
                          <div>
                            <h3 className="text-sm font-bold">
                              Ventas del{' '}
                              {formatearFechaCorta(
                                fechaReporte
                              )}
                            </h3>

                            <p
                              className={`text-xs ${tema.textoSecundario}`}
                            >
                              Detalle de las
                              operaciones
                            </p>
                          </div>

                          <span
                            className={`text-xs ${tema.textoSecundario}`}
                          >
                            {
                              ventasReporte.length
                            }{' '}
                            registros
                          </span>
                        </div>

                        <div className="grid grid-cols-[80px_1fr_1fr_120px_120px] gap-3 border-b px-4 py-3 text-xs font-bold">
                          <span>N.º</span>
                          <span>Cliente</span>
                          <span>Fecha</span>
                          <span>Estado</span>
                          <span className="text-right">
                            Total
                          </span>
                        </div>

                        {reportePaginado.map(
                          (
                            venta,
                            indice
                          ) => (
                            <div
                              key={
                                venta.id_pedido ||
                                venta.id ||
                                indice
                              }
                              className={`grid grid-cols-[80px_1fr_1fr_120px_120px] items-center gap-3 border-b px-4 py-3 text-xs last:border-b-0 ${tema.borde}`}
                            >
                              <span className="font-semibold">
                                #
                                {venta.id_pedido ||
                                  venta.id ||
                                  indice +
                                    1}
                              </span>

                              <span className="truncate">
                                {obtenerNombreClienteVenta(
                                  venta
                                )}
                              </span>

                              <span
                                className={
                                  tema.textoSecundario
                                }
                              >
                                {formatearFecha(
                                  venta.fecha ||
                                    venta.creado_en
                                )}
                              </span>

                              <span>
                                {venta.estado ||
                                  'Sin estado'}
                              </span>

                              <span className="text-right font-bold">
                                {formatearPrecio(
                                  venta.total
                                )}
                              </span>
                            </div>
                          )
                        )}

                        {reportePaginado.length ===
                          0 && (
                          <div
                            className={`flex h-40 items-center justify-center text-sm ${tema.textoSecundario}`}
                          >
                            No hay ventas para
                            esta fecha.
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t px-4 py-3">
                          <span
                            className={`text-xs ${tema.textoSecundario}`}
                          >
                            Reporte del{' '}
                            {formatearFechaCorta(
                              fechaReporte
                            )}
                          </span>

                          <BotonesPaginacion
                            pagina={
                              paginaReporte
                            }
                            totalPaginas={
                              totalPaginasReporte
                            }
                            cambiarPagina={
                              setPaginaReporte
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {mostrarModalPqr && pqrEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
          <div className={`w-full max-w-xl rounded-2xl border shadow-2xl ${tema.panel} ${tema.borde}`}>
            <div className={`flex items-center justify-between border-b px-5 py-4 ${tema.borde}`}>
              <div>
                <h2 className="font-bold">Responder PQR #{obtenerIdPqr(pqrEditando)}</h2>
                <p className={`text-xs ${tema.textoSecundario}`}>
                  {obtenerNombreClientePqr(pqrEditando)} · {obtenerAsuntoPqr(pqrEditando)}
                </p>
              </div>
              <button type="button" onClick={cerrarModalPqr} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={guardarRespuestaPqr} className="p-5">
              <div className={`mb-4 rounded-xl border p-3 text-sm ${tema.panelSecundario} ${tema.borde}`}>
                <p className="font-semibold">Descripción</p>
                <p className={`mt-1 whitespace-pre-wrap text-xs ${tema.textoSecundario}`}>
                  {obtenerTextoPqr(pqrEditando.descripcion, 'Sin descripción')}
                </p>
              </div>

              <label className="mb-1 block text-xs font-semibold">Respuesta</label>
              <textarea
                required
                rows={5}
                value={respuestaPqr}
                onChange={(event) => setRespuestaPqr(event.target.value)}
                placeholder="Escribe la respuesta para el cliente"
                className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
              />

              <label className="mb-1 mt-4 block text-xs font-semibold">Estado</label>
              <select
                value={estadoPqr}
                onChange={(event) => setEstadoPqr(event.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
              >
                <option value="En proceso">En proceso</option>
                <option value="Respondida">Respondida</option>
                <option value="Resuelta">Resuelta</option>
                <option value="Cerrada">Cerrada</option>
              </select>

              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={cerrarModalPqr} className={botonSecundario}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPqr}
                  className={`${botonPrincipal} ${guardandoPqr ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  {guardandoPqr ? 'Guardando...' : 'Guardar respuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL USUARIO
      ======================================================== */}
      {mostrarModalUsuario &&
        usuarioEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
            <div
              className={`w-full max-w-2xl rounded-2xl border shadow-2xl ${tema.panel} ${tema.borde}`}
            >
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="font-bold">
                    {usuarioEditando.id_usuario
                      ? 'Editar usuario'
                      : 'Nuevo usuario'}
                  </h2>

                  <p
                    className={`text-xs ${tema.textoSecundario}`}
                  >
                    Información de la cuenta
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalUsuario(
                      false
                    )
                    setUsuarioEditando(
                      null
                    )
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X
                    size={17}
                  />
                </button>
              </div>

              <form
                onSubmit={
                  guardarUsuario
                }
                className="p-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Nombres
                    </label>

                    <input
                      required
                      value={
                        usuarioEditando.nombres ||
                        ''
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            nombres:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Apellidos
                    </label>

                    <input
                      required
                      value={
                        usuarioEditando.apellidos ||
                        ''
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            apellidos:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Tipo de documento
                    </label>

                    <select
                      value={
                        usuarioEditando.tipo_documento ||
                        'CC'
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            tipo_documento:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    >
                      <option value="CC">
                        Cédula de ciudadanía
                      </option>

                      <option value="TI">
                        Tarjeta de identidad
                      </option>

                      <option value="CE">
                        Cédula de extranjería
                      </option>

                      <option value="NIT">
                        NIT
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Número de documento
                    </label>

                    <input
                      value={
                        usuarioEditando.numero_documento ||
                        ''
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            numero_documento:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Teléfono
                    </label>

                    <input
                      value={
                        usuarioEditando.telefono ||
                        ''
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            telefono:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Correo
                    </label>

                    <input
                      required
                      type="email"
                      value={
                        usuarioEditando.email ||
                        ''
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            email:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Rol
                    </label>

                    <select
                      value={
                        usuarioEditando.rol_id ??
                        2
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            rol_id:
                              Number(
                                event.target
                                  .value
                              ),
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    >
                      <option value={1}>
                        Administrador
                      </option>

                      <option value={2}>
                        Cliente
                      </option>

                      <option value={3}>
                        Empleado
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Estado
                    </label>

                    <select
                      value={
                        Number(
                          usuarioEditando.estado
                        ) === 1
                          ? 1
                          : 0
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            estado:
                              Number(
                                event.target
                                  .value
                              ),
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    >
                      <option value={1}>
                        Activo
                      </option>

                      <option value={0}>
                        Inactivo
                      </option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold">
                      Dirección
                    </label>

                    <input
                      value={
                        usuarioEditando.direccion ||
                        ''
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            direccion:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold">
                      {usuarioEditando.id_usuario
                        ? 'Nueva contraseña (opcional)'
                        : 'Contraseña'}
                    </label>

                    <input
                      required={
                        !usuarioEditando.id_usuario
                      }
                      type="password"
                      value={
                        usuarioEditando.password ||
                        ''
                      }
                      onChange={(event) =>
                        setUsuarioEditando(
                          {
                            ...usuarioEditando,
                            password:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarModalUsuario(
                        false
                      )
                      setUsuarioEditando(
                        null
                      )
                    }}
                    className={botonSecundario}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={
                      guardandoUsuario
                    }
                    className={`${
                      botonPrincipal
                    } ${
                      guardandoUsuario
                        ? 'cursor-not-allowed opacity-60'
                        : ''
                    }`}
                  >
                    {guardandoUsuario
                      ? 'Guardando...'
                      : 'Guardar usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ========================================================
          MODAL PRODUCTO
      ======================================================== */}
      {mostrarModalProducto &&
        productoEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
            <div
              className={`w-full max-w-2xl rounded-2xl border shadow-2xl ${tema.panel} ${tema.borde}`}
            >
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="font-bold">
                    {productoEditando.id_producto ||
                    productoEditando.id
                      ? 'Editar producto'
                      : 'Nuevo producto'}
                  </h2>

                  <p
                    className={`text-xs ${tema.textoSecundario}`}
                  >
                    Información del producto
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalProducto(
                      false
                    )
                    setProductoEditando(
                      null
                    )
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X
                    size={17}
                  />
                </button>
              </div>

              <form
                onSubmit={
                  guardarProducto
                }
                className="p-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold">
                      Nombre del producto
                    </label>

                    <input
                      required
                      value={
                        productoEditando.nombre_producto ||
                        productoEditando.nombre ||
                        ''
                      }
                      onChange={(event) =>
                        setProductoEditando(
                          {
                            ...productoEditando,
                            nombre_producto:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Categoría
                    </label>

                    <input
                      value={
                        productoEditando.categoria ||
                        ''
                      }
                      onChange={(event) =>
                        setProductoEditando(
                          {
                            ...productoEditando,
                            categoria:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Precio
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      value={
                        productoEditando.precio ??
                        ''
                      }
                      onChange={(event) =>
                        setProductoEditando(
                          {
                            ...productoEditando,
                            precio:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Stock
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      value={
                        productoEditando.stock ??
                        ''
                      }
                      onChange={(event) =>
                        setProductoEditando(
                          {
                            ...productoEditando,
                            stock:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Imagen
                    </label>

                    <input
                      value={
                        productoEditando.imagen ||
                        ''
                      }
                      onChange={(event) =>
                        setProductoEditando(
                          {
                            ...productoEditando,
                            imagen:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold">
                      Descripción
                    </label>

                    <textarea
                      rows={3}
                      value={
                        productoEditando.descripcion ||
                        ''
                      }
                      onChange={(event) =>
                        setProductoEditando(
                          {
                            ...productoEditando,
                            descripcion:
                              event.target
                                .value,
                          }
                        )
                      }
                      className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${tema.input}`}
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarModalProducto(
                        false
                      )
                      setProductoEditando(
                        null
                      )
                    }}
                    className={botonSecundario}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={
                      guardandoProducto
                    }
                    className={`${
                      botonPrincipal
                    } ${
                      guardandoProducto
                        ? 'cursor-not-allowed opacity-60'
                        : ''
                    }`}
                  >
                    {guardandoProducto
                      ? 'Guardando...'
                      : 'Guardar producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}

export default PanelAdmin
