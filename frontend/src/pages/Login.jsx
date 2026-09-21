import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import RegisterModal from '../components/RegisterModal'

function Login({ modoOscuro }) {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  })

  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // =====================================================
  // MODAL DE REGISTRO
  // =====================================================

  const [mostrarRegistro, setMostrarRegistro] =
    useState(false)

  // =====================================================
  // VALIDAR CAMPOS
  // =====================================================

  const validarCampo = (campo, valor) => {

    let mensaje = ''

    switch (campo) {

      case 'correo':

        if (!valor.trim()) {

          mensaje =
            'El correo es obligatorio.'

        } else if (
          valor.trim().length > 100
        ) {

          mensaje =
            'El correo no puede superar los 100 caracteres.'

        } else {

          const regexCorreo =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/

          if (
            !regexCorreo.test(
              valor.trim()
            )
          ) {

            mensaje =
              'Ingresa un correo electrónico válido.'

          }

        }

        break

      case 'password':

        if (!valor) {

          mensaje =
            'La contraseña es obligatoria.'

        } else if (
          valor.length < 8
        ) {

          mensaje =
            'La contraseña debe tener mínimo 8 caracteres.'

        } else if (
          valor.length > 50
        ) {

          mensaje =
            'La contraseña no puede superar los 50 caracteres.'

        }

        break

      default:
        break
    }

    return mensaje
  }

  // =====================================================
  // CAMBIO DE INPUT
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    const mensaje =
      validarCampo(
        name,
        value
      )

    setErrores((prev) => ({
      ...prev,
      [name]: mensaje
    }))

    setError('')
  }

  // =====================================================
  // VALIDAR FORMULARIO
  // =====================================================

  const validarFormulario = () => {

    const nuevosErrores = {}

    const errorCorreo =
      validarCampo(
        'correo',
        formData.correo
      )

    const errorPassword =
      validarCampo(
        'password',
        formData.password
      )

    if (errorCorreo) {

      nuevosErrores.correo =
        errorCorreo

    }

    if (errorPassword) {

      nuevosErrores.password =
        errorPassword

    }

    setErrores(
      nuevosErrores
    )

    return (
      Object.keys(
        nuevosErrores
      ).length === 0
    )
  }

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault()

    setError('')

    if (!validarFormulario()) {
      return
    }

    setCargando(true)

    try {

      const response =
        await fetch(
          'http://127.0.0.1:8000/api/auth/login',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              email:
                formData.correo.trim(),

              password:
                formData.password
            })
          }
        )

      const datos =
        await response.json()

      // =================================================
      // ERROR DEL BACKEND
      // =================================================

      if (!response.ok) {

        setError(
          datos.detail ||
          datos.message ||
          'Correo o contraseña incorrectos.'
        )

        return
      }

      const usuarioLogin =
        datos.usuario

      // =================================================
      // CUENTA INACTIVA
      // =================================================

      const cuentaInactiva =
        usuarioLogin?.estado === false ||
        usuarioLogin?.estado === 0 ||
        usuarioLogin?.estado === '0' ||
        usuarioLogin?.estado === 'inactivo'

      if (cuentaInactiva) {

        setError(
          'Tu cuenta ha sido inactivada. No puedes iniciar sesión.'
        )

        return
      }

      // =================================================
      // LIMPIAR CARRITO ANTERIOR
      // =================================================

      localStorage.removeItem(
        'cellworld_cart'
      )

      // =================================================
      // AVISAR CAMBIO DE USUARIO
      // =================================================

      window.dispatchEvent(
        new CustomEvent(
          'usuarioCambio',
          {
            detail: {
              userId:
                usuarioLogin?.id_usuario
            }
          }
        )
      )

      // =================================================
      // GUARDAR SESIÓN
      // =================================================

      localStorage.setItem(
        'token',
        datos.token
      )

      localStorage.setItem(
        'usuario',
        JSON.stringify(
          usuarioLogin
        )
      )

      // =================================================
      // IR AL INICIO
      // =================================================

      navigate('/')

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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <div
        className={`
          min-h-screen
          flex
          items-center
          justify-center
          px-4
          py-10
          transition-colors
          duration-500
          ${
            modoOscuro
              ? 'bg-[#0b1422]'
              : 'bg-slate-50'
          }
        `}
      >

        <div
          className={`
            w-full
            max-w-md
            rounded-2xl
            p-8
            shadow-xl
            border
            transition-colors
            duration-500
            ${
              modoOscuro
                ? 'bg-[#111c2d] border-slate-700'
                : 'bg-white border-slate-200'
            }
          `}
        >

          {/* =================================================
              TÍTULO
          ================================================= */}

          <div className="text-center mb-8">

            <h1
              className={`
                text-3xl
                font-bold
                transition-colors
                duration-300
                ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-slate-800'
                }
              `}
            >
              Iniciar sesión
            </h1>

            <p
              className={`
                mt-2
                transition-colors
                duration-300
                ${
                  modoOscuro
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }
              `}
            >
              Ingresa a tu cuenta de CellWorld
            </p>

          </div>

          {/* =================================================
              ERROR GENERAL
          ================================================= */}

          {error && (

            <div
              className={`
                mb-5
                rounded-lg
                border
                px-4
                py-3
                text-sm
                ${
                  modoOscuro
                    ? 'border-red-800 bg-red-950/40 text-red-300'
                    : 'border-red-300 bg-red-50 text-red-700'
                }
              `}
            >
              {error}
            </div>

          )}

          {/* =================================================
              FORMULARIO
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* =================================================
                CORREO
            ================================================= */}

            <div>

              <label
                htmlFor="correo"
                className={`
                  block
                  mb-2
                  text-sm
                  font-medium
                  ${
                    modoOscuro
                      ? 'text-slate-200'
                      : 'text-slate-700'
                  }
                `}
              >
                Correo electrónico
              </label>

              <input
                id="correo"
                name="correo"
                type="email"
                value={
                  formData.correo
                }
                onChange={
                  handleChange
                }
                maxLength={100}
                placeholder="correo@ejemplo.com"
                className={`
                  w-full
                  rounded-lg
                  border
                  px-4
                  py-3
                  outline-none
                  transition
                  ${
                    modoOscuro
                      ? 'bg-[#0b1422] text-white placeholder-slate-400'
                      : 'bg-white text-slate-800 placeholder-slate-400'
                  }
                  ${
                    errores.correo
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : modoOscuro
                        ? 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }
                `}
              />

              {errores.correo && (

                <p
                  className={`
                    mt-1
                    text-sm
                    ${
                      modoOscuro
                        ? 'text-red-400'
                        : 'text-red-500'
                    }
                  `}
                >
                  {errores.correo}
                </p>

              )}

            </div>

            {/* =================================================
                CONTRASEÑA
            ================================================= */}

            <div>

              <label
                htmlFor="password"
                className={`
                  block
                  mb-2
                  text-sm
                  font-medium
                  ${
                    modoOscuro
                      ? 'text-slate-200'
                      : 'text-slate-700'
                  }
                `}
              >
                Contraseña
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                maxLength={50}
                placeholder="Ingresa tu contraseña"
                className={`
                  w-full
                  rounded-lg
                  border
                  px-4
                  py-3
                  outline-none
                  transition
                  ${
                    modoOscuro
                      ? 'bg-[#0b1422] text-white placeholder-slate-400'
                      : 'bg-white text-slate-800 placeholder-slate-400'
                  }
                  ${
                    errores.password
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : modoOscuro
                        ? 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }
                `}
              />

              {errores.password && (

                <p
                  className={`
                    mt-1
                    text-sm
                    ${
                      modoOscuro
                        ? 'text-red-400'
                        : 'text-red-500'
                    }
                  `}
                >
                  {errores.password}
                </p>

              )}

            </div>

            {/* =================================================
                RECUPERAR CONTRASEÑA
            ================================================= */}

            <div className="text-right">

              <Link
                to="/recuperar-contrasena"
                className={`
                  text-sm
                  hover:underline
                  ${
                    modoOscuro
                      ? 'text-blue-400'
                      : 'text-blue-600'
                  }
                `}
              >
                ¿Olvidaste tu contraseña?
              </Link>

            </div>

            {/* =================================================
                BOTÓN LOGIN
            ================================================= */}

            <button
              type="submit"
              disabled={cargando}
              className="
                w-full
                rounded-lg
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-blue-400
                text-white
                font-semibold
                py-3
                transition
                duration-200
                disabled:cursor-not-allowed
              "
            >
              {cargando
                ? 'Iniciando sesión...'
                : 'Iniciar sesión'}
            </button>

          </form>

          {/* =================================================
              REGISTRO
          ================================================= */}

          <div
            className={`
              mt-6
              text-center
              text-sm
              ${
                modoOscuro
                  ? 'text-slate-400'
                  : 'text-slate-600'
              }
            `}
          >

            ¿No tienes una cuenta?{' '}

            <button
              type="button"
              onClick={() =>
                setMostrarRegistro(true)
              }
              className={`
                font-semibold
                hover:underline
                ${
                  modoOscuro
                    ? 'text-blue-400'
                    : 'text-blue-600'
                }
              `}
            >
              Regístrate
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          MODAL REGISTRO
      ===================================================== */}

      {mostrarRegistro && (

        <RegisterModal
          modoOscuro={modoOscuro}
          cerrarModal={() =>
            setMostrarRegistro(false)
          }
        />

      )}

    </>
  )
}

export default Login