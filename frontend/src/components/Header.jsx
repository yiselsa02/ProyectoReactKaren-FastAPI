import { useState, useEffect } from 'react'
import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom'

import {
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  ShoppingCart,
  Minus,
  Plus,
  Trash2
} from 'lucide-react'

import { useCart } from '../context/CartContext'

import logoHeader from '../assets/logo-header.png'
import logoHeaderDark from '../assets/logo-header-dark.png'

function Header({
  modoOscuro,
  cambiarModoOscuro
}) {

  const [menuAbierto, setMenuAbierto] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [menuUsuario, setMenuUsuario] = useState(false)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [comprando, setComprando] = useState(false)

  const {
    items,
    count,
    total,
    updateQuantity,
    removeItem,
    checkout,
    clearCartOnLogout
  } = useCart()

  const location = useLocation()
  const navigate = useNavigate()

  // =====================================================
  // CARGAR USUARIO
  // =====================================================

  useEffect(() => {

    const cargarUsuario = () => {

      const usuarioGuardado =
        localStorage.getItem('usuario')

      if (usuarioGuardado) {

        try {

          const usuarioParseado =
            JSON.parse(usuarioGuardado)

          const usuarioNormalizado = {
            ...usuarioParseado,
            rol_id: Number(
              usuarioParseado.rol_id
            )
          }

          setUsuario(usuarioNormalizado)

        } catch (error) {

          console.error(
            'Error al parsear usuario:',
            error
          )

          setUsuario(null)
        }

      } else {

        setUsuario(null)
      }
    }

    cargarUsuario()

  }, [location])

  // =====================================================
  // OBTENER RUTA DEL PANEL
  // =====================================================

  const obtenerRutaPanel = () => {

    if (!usuario) {
      return '/login'
    }

    const rolId = Number(usuario.rol_id)

    if (rolId === 1) {
      return '/admin'
    }

    if (rolId === 2) {
      return '/cliente'
    }

    if (rolId === 3) {
      return '/empleado'
    }

    return '/'
  }

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const cerrarSesion = () => {

    clearCartOnLogout()

    localStorage.removeItem('token')
    localStorage.removeItem('usuario')

    setUsuario(null)
    setMenuUsuario(false)
    setMenuAbierto(false)
    setCarritoAbierto(false)

    window.dispatchEvent(
      new CustomEvent(
        'usuarioCambio',
        {
          detail: {
            userId: null
          }
        }
      )
    )

    navigate('/')
  }

  // =====================================================
  // COMPRAR CARRITO
  // =====================================================

  const comprarCarrito = async () => {

    setComprando(true)

    try {

      const pedido = await checkout()

      const invoice = `CELLWORLD
Factura #${pedido.id_pedido}
Total: $${Number(
        pedido.total
      ).toLocaleString('es-CO')}
Estado: ${pedido.estado}`

      const blob = new Blob(
        [invoice],
        {
          type: 'text/plain;charset=utf-8'
        }
      )

      const url =
        URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = url

      link.download =
        `factura-cellworld-${pedido.id_pedido}.txt`

      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      setCarritoAbierto(false)

      alert(
        'Compra realizada. La factura fue descargada.'
      )

    } catch (error) {

      alert(
        error?.message ||
        'No se pudo realizar la compra.'
      )

    } finally {

      setComprando(false)
    }
  }

  // =====================================================
  // ENLACES
  // =====================================================

  const enlaces = [
    {
      nombre: 'Inicio',
      ruta: '/'
    },
    {
      nombre: 'Productos',
      ruta: '/productos'
    },
    {
      nombre: 'Quiénes somos',
      ruta: '/quienes-somos'
    },
    {
      nombre: 'Contacto',
      ruta: '/contacto'
    }
  ]

  // =====================================================
  // ACTIVO
  // =====================================================

  const esActivo = (ruta) => {
    return location.pathname === ruta
  }

  // =====================================================
  // CERRAR MENÚ
  // =====================================================

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  // =====================================================
  // CAMBIAR TEMA
  // =====================================================

  const cambiarTema = () => {
    cambiarModoOscuro()
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        modoOscuro
          ? 'border-slate-800 bg-[#08111f]/95'
          : 'border-gray-200 bg-white/95'
      }`}
    >

      <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            LOGO
        ===================================================== */}

        <Link
          to="/"
          onClick={cerrarMenu}
          aria-label="CellWorld - Inicio"
          className="group flex shrink-0 items-center gap-3"
        >

          <div className="transition-transform duration-300 group-hover:scale-105">

            <img
              src={
                modoOscuro
                  ? logoHeaderDark
                  : logoHeader
              }
              alt="Logo CellWorld"
              className="h-12 w-12 object-contain"
            />

          </div>

          <div className="leading-none">

            <h1
              className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${
                modoOscuro
                  ? 'text-white group-hover:text-blue-400'
                  : 'text-gray-900 group-hover:text-blue-600'
              }`}
            >
              Cell
              <span className="text-blue-600 transition-colors duration-300 group-hover:text-blue-700">
                World
              </span>
            </h1>

            <p
              className={`mt-1 text-[9px] font-bold tracking-[1.5px] transition-colors duration-300 ${
                modoOscuro
                  ? 'text-slate-500 group-hover:text-blue-400'
                  : 'text-gray-400 group-hover:text-blue-500'
              }`}
            >
              TECNOLOGÍA
            </p>

          </div>

        </Link>

        {/* =====================================================
            BOTÓN HAMBURGUESA
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            setMenuAbierto(!menuAbierto)
          }
          aria-label={
            menuAbierto
              ? 'Cerrar menú'
              : 'Abrir menú'
          }
          aria-expanded={menuAbierto}
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 md:hidden ${
            modoOscuro
              ? 'border-slate-700 bg-[#121d2e] text-slate-300 hover:border-blue-500 hover:text-blue-400'
              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >

          {menuAbierto ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}

        </button>

        {/* =====================================================
            CARRITO MOBILE
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            setCarritoAbierto(
              !carritoAbierto
            )
          }
          aria-label="Abrir carrito"
          className={`relative mr-2 flex h-10 w-10 items-center justify-center rounded-xl border md:hidden ${
            modoOscuro
              ? 'border-slate-700 bg-[#121d2e] text-blue-400'
              : 'border-gray-200 bg-gray-50 text-blue-600'
          }`}
        >

          <ShoppingCart size={19} />

          {count > 0 && (

            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
              {count}
            </span>

          )}

        </button>

        {/* =====================================================
            NAVEGACIÓN DESKTOP
        ===================================================== */}

        <nav className="hidden items-center gap-6 md:flex lg:gap-8">

          {enlaces.map((enlace) => {

            const activo =
              esActivo(enlace.ruta)

            return (

              <Link
                key={enlace.ruta}
                to={enlace.ruta}
                className={`group relative py-2 text-sm font-semibold transition-colors duration-200 ${
                  activo
                    ? 'text-blue-600'
                    : modoOscuro
                      ? 'text-slate-300 hover:text-blue-400'
                      : 'text-gray-600 hover:text-blue-600'
                }`}
              >

                {enlace.nombre}

                <span
                  className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-blue-600 transition-all duration-300 ${
                    activo
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                />

              </Link>

            )

          })}

          {/* =====================================================
              USUARIO DESKTOP
          ===================================================== */}

          {usuario ? (

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setMenuUsuario(
                    !menuUsuario
                  )
                }
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  modoOscuro
                    ? 'border-blue-500 bg-blue-600 text-white hover:border-white hover:bg-white hover:text-blue-600'
                    : 'border-blue-600 bg-blue-600 text-white hover:border-blue-600 hover:bg-white hover:text-blue-600'
                }`}
              >

                👤 {usuario.nombres}

              </button>

              {menuUsuario && (

                <div
                  className={`absolute right-0 mt-2 w-48 rounded-lg border shadow-lg ${
                    modoOscuro
                      ? 'border-slate-700 bg-[#121d2e]'
                      : 'border-gray-200 bg-white'
                  }`}
                >

                  <Link
                    to={obtenerRutaPanel()}
                    onClick={() => {

                      setMenuUsuario(false)
                      setMenuAbierto(false)

                    }}
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${
                      modoOscuro
                        ? 'text-slate-300 hover:bg-blue-500/10 hover:text-blue-400'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    Mi Panel
                  </Link>

                  <button
                    type="button"
                    onClick={cerrarSesion}
                    className={`flex w-full items-center gap-2 border-t px-4 py-2 text-sm font-medium text-red-500 transition-colors ${
                      modoOscuro
                        ? 'border-slate-700 hover:bg-red-500/10'
                        : 'border-gray-200 hover:bg-red-50'
                    }`}
                  >

                    <LogOut size={16} />

                    Cerrar sesión

                  </button>

                </div>

              )}

            </div>

          ) : (

            <Link
              to="/login"
              className={`rounded-lg border px-4 py-2 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                esActivo('/login')
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : modoOscuro
                    ? 'border-blue-500 bg-blue-600 text-white hover:border-white hover:bg-white hover:text-blue-600'
                    : 'border-blue-600 bg-blue-600 text-white hover:border-blue-600 hover:bg-white hover:text-blue-600'
              }`}
            >
              Iniciar sesión
            </Link>

          )}

          {/* =====================================================
              CARRITO DESKTOP
          ===================================================== */}

          <button
            type="button"
            onClick={() =>
              setCarritoAbierto(
                !carritoAbierto
              )
            }
            aria-label="Abrir carrito"
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              modoOscuro
                ? 'border-slate-700 bg-[#121d2e] text-blue-400 hover:border-blue-500'
                : 'border-gray-200 bg-gray-50 text-blue-600 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >

            <ShoppingCart size={19} />

            {count > 0 && (

              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {count}
              </span>

            )}

          </button>

          {/* =====================================================
              MODO OSCURO
          ===================================================== */}

          <button
            type="button"
            onClick={cambiarTema}
            aria-label={
              modoOscuro
                ? 'Activar modo claro'
                : 'Activar modo oscuro'
            }
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
              modoOscuro
                ? 'border-slate-700 bg-[#121d2e] text-blue-400 hover:border-blue-500 hover:bg-[#17263c]'
                : 'border-gray-200 bg-gray-50 text-blue-600 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >

            {modoOscuro ? (

              <Sun
                size={19}
                strokeWidth={2}
              />

            ) : (

              <Moon
                size={19}
                strokeWidth={2}
              />

            )}

          </button>

        </nav>

      </div>

      {/* =====================================================
          CARRITO
      ===================================================== */}

      {carritoAbierto && (

        <div
          className={`absolute right-4 top-[76px] z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl sm:right-6 lg:right-8 ${
            modoOscuro
              ? 'border-slate-700 bg-[#121d2e]'
              : 'border-gray-200 bg-white'
          }`}
        >

          <div className="mb-3 flex items-center justify-between">

            <h2
              className={`font-bold ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Tu carrito
            </h2>

            <span className="text-sm font-semibold text-blue-600">
              {count} artículo(s)
            </span>

          </div>

          {items.length === 0 ? (

            <p
              className={`py-6 text-center text-sm ${
                modoOscuro
                  ? 'text-slate-400'
                  : 'text-gray-500'
              }`}
            >
              Tu carrito está vacío.
            </p>

          ) : (

            <div className="space-y-3">

              {items.map((item) => (

                <div
                  key={item.id}
                  className={`flex items-center gap-3 border-b pb-3 ${
                    modoOscuro
                      ? 'border-slate-700'
                      : 'border-gray-100'
                  }`}
                >

                  <div className="min-w-0 flex-1">

                    <p
                      className={`truncate text-sm font-bold ${
                        modoOscuro
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      {item.name}
                    </p>

                    <p className="text-sm font-semibold text-blue-600">
                      $
                      {Number(
                        item.price
                      ).toLocaleString('es-CO')}
                    </p>

                  </div>

                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                      className={`rounded border p-1 ${
                        modoOscuro
                          ? 'border-slate-600 text-slate-200'
                          : 'text-gray-700'
                      }`}
                    >
                      <Minus size={13} />
                    </button>

                    <span
                      className={`w-5 text-center text-sm font-bold ${
                        modoOscuro
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                      className={`rounded border p-1 ${
                        modoOscuro
                          ? 'border-slate-600 text-slate-200'
                          : 'text-gray-700'
                      }`}
                    >
                      <Plus size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      aria-label="Eliminar producto"
                      className="ml-1 p-1 text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                </div>

              ))}

              <div
                className={`flex justify-between pt-2 font-extrabold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >

                <span>
                  Total
                </span>

                <span className="text-blue-600">
                  $
                  {Number(
                    total
                  ).toLocaleString('es-CO')}
                </span>

              </div>

              <button
                type="button"
                disabled={comprando}
                onClick={comprarCarrito}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {comprando
                  ? 'Procesando...'
                  : 'Comprar'}
              </button>

            </div>

          )}

        </div>

      )}

      {/* =====================================================
          MENÚ MOBILE
      ===================================================== */}

      {menuAbierto && (

        <div
          className={`border-t md:hidden ${
            modoOscuro
              ? 'border-slate-800 bg-[#08111f]'
              : 'border-gray-200 bg-white'
          }`}
        >

          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">

            {enlaces.map((enlace) => {

              const activo =
                esActivo(enlace.ruta)

              return (

                <Link
                  key={enlace.ruta}
                  to={enlace.ruta}
                  onClick={cerrarMenu}
                  className={`group relative rounded-lg px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    activo
                      ? modoOscuro
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : modoOscuro
                        ? 'text-slate-300 hover:bg-blue-500/10 hover:text-blue-400'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >

                  {enlace.nombre}

                  <span
                    className={`absolute bottom-1 left-3 h-0.5 rounded-full bg-blue-600 transition-all duration-300 ${
                      activo
                        ? 'w-10'
                        : 'w-0 group-hover:w-10'
                    }`}
                  />

                </Link>

              )

            })}

            {/* USUARIO MOBILE */}

            {usuario ? (

              <>

                <Link
                  to={obtenerRutaPanel()}
                  onClick={cerrarMenu}
                  className={`mt-3 rounded-lg border px-4 py-3 text-center text-sm font-bold transition-all duration-200 ${
                    modoOscuro
                      ? 'border-blue-500 bg-blue-600 text-white hover:border-white hover:bg-white hover:text-blue-600'
                      : 'border-blue-600 bg-blue-600 text-white hover:bg-white hover:text-blue-600'
                  }`}
                >
                  👤 {usuario.nombres} - Mi Panel
                </Link>

                <button
                  type="button"
                  onClick={cerrarSesion}
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold text-red-500 transition-all duration-200 ${
                    modoOscuro
                      ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
                      : 'border-red-200 bg-red-50 hover:bg-red-100'
                  }`}
                >

                  <LogOut size={18} />

                  Cerrar sesión

                </button>

              </>

            ) : (

              <Link
                to="/login"
                onClick={cerrarMenu}
                className={`mt-3 rounded-lg border px-4 py-3 text-center text-sm font-bold transition-all duration-200 ${
                  modoOscuro
                    ? 'border-blue-500 bg-blue-600 text-white hover:border-white hover:bg-white hover:text-blue-600'
                    : 'border-blue-600 bg-blue-600 text-white hover:bg-white hover:text-blue-600'
                }`}
              >
                Iniciar sesión
              </Link>

            )}

            {/* MODO OSCURO MOBILE */}

            <button
              type="button"
              onClick={cambiarTema}
              className={`mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#121d2e] text-blue-400 hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 text-blue-600 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >

              {modoOscuro ? (

                <>
                  <Sun size={18} />
                  Modo claro
                </>

              ) : (

                <>
                  <Moon size={18} />
                  Modo oscuro
                </>

              )}

            </button>

          </nav>

        </div>

      )}

    </header>
  )
}

export default Header