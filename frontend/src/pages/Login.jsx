import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegisterModal from '../components/RegisterModal'

import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'

function Login({ modoOscuro }) {
  const navigate = useNavigate()

  // ==========================================================
  // URL DEL BACKEND
  // ==========================================================

  const API_URL = (
    import.meta.env.VITE_API_URL ||
    'https://cellworld-backend.vercel.app'
  ).replace(/\/$/, '')

  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarRegistro, setMostrarRegistro] = useState(false)

  // ==========================================================
  // CAMBIO DE CAMPOS
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((actual) => ({
      ...actual,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  // ==========================================================
  // VALIDACIÓN
  // ==========================================================

  const validarFormulario = () => {
    if (!formData.correo.trim()) {
      setError('Ingresa tu correo electrónico.')
      return false
    }

    if (!formData.password) {
      setError('Ingresa tu contraseña.')
      return false
    }

    return true
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    if (!validarFormulario()) {
      return
    }

    setCargando(true)

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.correo.trim(),
            password: formData.password,
          }),
        }
      )

      let datos = {}

      try {
        datos = await response.json()
      } catch {
        datos = {}
      }

      // ========================================================
      // ERROR DEL SERVIDOR
      // ========================================================

      if (!response.ok) {
        if (typeof datos.detail === 'string') {
          setError(datos.detail)
        } else if (Array.isArray(datos.detail)) {
          setError(
            datos.detail
              .map((item) => {
                if (typeof item === 'string') {
                  return item
                }

                return (
                  item?.msg ||
                  'Error de validación.'
                )
              })
              .join(', ')
          )
        } else {
          setError(
            datos.message ||
            'Correo o contraseña incorrectos.'
          )
        }

        return
      }

      // ========================================================
      // OBTENER USUARIO
      // ========================================================

      const usuarioLogin = datos.usuario

      if (!usuarioLogin) {
        setError(
          'El servidor no devolvió la información del usuario.'
        )
        return
      }

      // ========================================================
      // VERIFICAR CUENTA INACTIVA
      // ========================================================

      const cuentaInactiva =
        usuarioLogin.estado === false ||
        usuarioLogin.estado === 0 ||
        usuarioLogin.estado === '0' ||
        usuarioLogin.estado === 'inactivo'

      if (cuentaInactiva) {
        setError(
          'Tu cuenta ha sido inactivada. No puedes iniciar sesión.'
        )

        return
      }

      // ========================================================
      // LIMPIAR CARRITO ANTERIOR
      // ========================================================

      localStorage.removeItem('cellworld_cart')

      // ========================================================
      // GUARDAR TOKEN
      // ========================================================

      if (datos.token) {
        localStorage.setItem(
          'token',
          datos.token
        )
      }

      // ========================================================
      // GUARDAR USUARIO
      // ========================================================

      localStorage.setItem(
        'usuario',
        JSON.stringify(usuarioLogin)
      )

      // ========================================================
      // AVISAR CAMBIO DE USUARIO
      // ========================================================

      window.dispatchEvent(
        new CustomEvent(
          'usuarioCambio',
          {
            detail: {
              userId:
                usuarioLogin.id_usuario,
            },
          }
        )
      )

      // ========================================================
      // REDIRECCIÓN SEGÚN ROL
      // ========================================================

      const rolId = Number(
        usuarioLogin.rol_id ??
        usuarioLogin.id_rol
      )

      if (rolId === 1) {
        navigate('/admin')
      } else if (rolId === 3) {
        navigate('/empleado')
      } else {
        navigate('/')
      }

    } catch (err) {
      console.error(
        'Error al iniciar sesión:',
        err
      )

      setError(
        'No se pudo conectar con el servidor.'
      )
    } finally {
      setCargando(false)
    }
  }

  // ==========================================================
  // REGISTRO EXITOSO
  // ==========================================================

  const handleRegistroExitoso = () => {
    setMostrarRegistro(false)

    setError('')

    setFormData({
      correo: '',
      password: '',
    })
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <div
        className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 ${
          modoOscuro
            ? 'bg-[#0b1220]'
            : 'bg-gray-50'
        }`}
      >
        <div
          className={`w-full max-w-md rounded-3xl border p-6 shadow-xl transition-colors duration-300 sm:p-8 ${
            modoOscuro
              ? 'border-slate-700 bg-[#0f1a2b]'
              : 'border-gray-200 bg-white'
          }`}
        >
          {/* ==================================================
              LOGO ORIGINAL
          ================================================== */}

          <div className="mb-7 flex justify-center">
            <img
              src={
                modoOscuro
                  ? logoDark
                  : logo
              }
              alt="CellWorld"
              className="h-auto w-44 object-contain sm:w-52"
            />
          </div>

          {/* ==================================================
              TÍTULO
          ================================================== */}

          <div className="mb-7 text-center">
            <h1
              className={`text-2xl font-bold ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Iniciar sesión
            </h1>

            <p
              className={`mt-2 text-sm ${
                modoOscuro
                  ? 'text-slate-400'
                  : 'text-gray-500'
              }`}
            >
              Ingresa a tu cuenta de CellWorld
            </p>
          </div>

          {/* ==================================================
              FORMULARIO
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* CORREO */}

            <div>
              <label
                htmlFor="correo"
                className={`mb-2 block text-sm font-semibold ${
                  modoOscuro
                    ? 'text-slate-200'
                    : 'text-gray-700'
                }`}
              >
                Correo electrónico
              </label>

              <input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                placeholder="tu@correo.com"
                autoComplete="email"
                disabled={cargando}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  modoOscuro
                    ? 'border-slate-700 bg-[#17263c] text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } ${
                  cargando
                    ? 'cursor-not-allowed opacity-60'
                    : ''
                }`}
              />
            </div>

            {/* CONTRASEÑA */}

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className={`block text-sm font-semibold ${
                    modoOscuro
                      ? 'text-slate-200'
                      : 'text-gray-700'
                  }`}
                >
                  Contraseña
                </label>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/recuperar-contrasena'
                    )
                  }
                  className="text-right text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                disabled={cargando}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  modoOscuro
                    ? 'border-slate-700 bg-[#17263c] text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } ${
                  cargando
                    ? 'cursor-not-allowed opacity-60'
                    : ''
                }`}
              />
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-500 text-xs font-bold">
                  !
                </span>

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* ==================================================
                BOTÓN
            ================================================== */}

            <button
              type="submit"
              disabled={cargando}
              className={`w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all ${
                cargando
                  ? 'cursor-not-allowed opacity-70'
                  : 'hover:bg-blue-700 hover:shadow-xl'
              }`}
            >
              {cargando
                ? 'Iniciando sesión...'
                : 'Iniciar sesión'}
            </button>
          </form>

          {/* ==================================================
              REGISTRO
          ================================================== */}

          <div
            className={`mt-7 border-t pt-6 text-center ${
              modoOscuro
                ? 'border-slate-700'
                : 'border-gray-200'
            }`}
          >
            <p
              className={`text-sm ${
                modoOscuro
                  ? 'text-slate-400'
                  : 'text-gray-500'
              }`}
            >
              ¿No tienes una cuenta?{' '}

              <button
                type="button"
                onClick={() => {
                  setError('')
                  setMostrarRegistro(true)
                }}
                className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Registrarse
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          MODAL DE REGISTRO
      ====================================================== */}

      {mostrarRegistro && (
        <RegisterModal
          modoOscuro={modoOscuro}
          onClose={() =>
            setMostrarRegistro(false)
          }
          onRegistroExitoso={
            handleRegistroExitoso
          }
        />
      )}
    </>
  )
}

export default Login

