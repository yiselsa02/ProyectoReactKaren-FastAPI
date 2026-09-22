import { useState } from 'react'
import { Link } from 'react-router-dom'

import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'

import Input from './input'
import { API_URL } from '../config'

function RecoverPassword({ modoOscuro }) {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [errorCodigo, setErrorCodigo] = useState('')
  const [errorContrasena, setErrorContrasena] = useState('')
  const [errorConfirmacion, setErrorConfirmacion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [modoCambio, setModoCambio] = useState(false)

  const validarCorreo = (correo) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)

  const manejarCambioCorreo = (e) => {
    setCorreo(e.target.value)
    setError('')
    setMensaje('')
  }

  const manejarCambioCodigo = (e) => {
    setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))
    setErrorCodigo('')
    setError('')
  }

  const manejarCambioContrasena = (e) => {
    setNuevaContrasena(e.target.value)
    setErrorContrasena('')
    setError('')
  }

  const manejarCambioConfirmacion = (e) => {
    setConfirmarContrasena(e.target.value)
    setErrorConfirmacion('')
    setError('')
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setErrorCodigo('')
    setErrorContrasena('')
    setErrorConfirmacion('')
    setMensaje('')

    if (modoCambio) {
      if (!/^\d{6}$/.test(codigo)) {
        setErrorCodigo(
          'Escribe el código de 6 dígitos recibido por correo.'
        )
        return
      }

      if (nuevaContrasena.length < 6) {
        setErrorContrasena(
          'La contraseña debe tener mínimo 6 caracteres.'
        )
        return
      }

      if (nuevaContrasena !== confirmarContrasena) {
        setErrorConfirmacion('Las contraseñas no coinciden.')
        return
      }

      setCargando(true)

      try {
        const respuesta = await fetch(
          `${API_URL}/api/auth/reset-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: codigo,
              password: nuevaContrasena,
            }),
          }
        )

        const datos = await respuesta.json()

        if (!respuesta.ok) {
          throw new Error(
            datos.detail ||
              'No se pudo cambiar la contraseña.'
          )
        }

        setMensaje(datos.message)
        setCodigo('')
        setNuevaContrasena('')
        setConfirmarContrasena('')
        setModoCambio(false)
      } catch (error) {
        setErrorCodigo(error.message)
      } finally {
        setCargando(false)
      }

      return
    }

    if (!correo.trim()) {
      setError('Por favor, ingresa tu correo electrónico.')
      return
    }

    if (!validarCorreo(correo)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    setCargando(true)

    try {
      const respuesta = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: correo.trim().toLowerCase(),
          }),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.detail ||
            'No se pudo enviar el correo.'
        )
      }

      setMensaje(datos.message)
      setModoCambio(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className={`relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden px-4 py-8 transition-colors duration-500 sm:py-12 ${
        modoOscuro ? 'bg-[#0b1422]' : 'bg-slate-50'
      }`}
    >
      {/* Fondo tecnológico */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgb(37 99 235) 0px, rgb(37 99 235) 1.5px, transparent 1.5px, transparent 32px), repeating-linear-gradient(-45deg, rgb(37 99 235) 0px, rgb(37 99 235) 1.5px, transparent 1.5px, transparent 32px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Brillo decorativo */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-96 sm:w-96 ${
          modoOscuro
            ? 'bg-blue-900/20'
            : 'bg-blue-200/30'
        }`}
      />

      {/* Tarjeta */}
      <div
        className={`relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-xl transition-all duration-300 sm:p-8 md:p-10 ${
          modoOscuro
            ? 'border-slate-700 bg-[#121d2e]/95 shadow-black/30'
            : 'border-blue-100 bg-white/95 shadow-blue-100'
        }`}
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center sm:mb-7">
          <img
            src={modoOscuro ? logoDark : logo}
            alt="CellWorld"
            className="h-16 w-16 object-contain sm:h-30 sm:w-30"
          />
        </div>

        {/* Encabezado */}
        <div className="mb-7 text-center sm:mb-8">
          <p className="mb-2 text-xs font-extrabold tracking-[1.5px] text-blue-600 sm:text-sm sm:tracking-[2px]">
            RECUPERAR ACCESO
          </p>

          <h1
            className={`mb-3 text-2xl font-bold sm:text-3xl ${
              modoOscuro
                ? 'text-white'
                : 'text-gray-900'
            }`}
          >
            {modoCambio
              ? 'Cambia tu contraseña'
              : 'Genera un código de recuperación'}
          </h1>

          <p
            className={`text-sm leading-6 ${
              modoOscuro
                ? 'text-slate-300'
                : 'text-gray-500'
            }`}
          >
            {modoCambio
              ? 'Escribe el código recibido y define una nueva contraseña para recuperar tu acceso.'
              : 'Escribe el correo registrado y genera un código de 6 dígitos para continuar.'}
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={manejarSubmit}
          className="space-y-5"
        >
          <Input
            label={
              modoCambio
                ? 'Código de 6 dígitos'
                : 'Correo donde recibirás el código'
            }
            name={
              modoCambio ? 'codigo' : 'correo'
            }
            type={
              modoCambio ? 'text' : 'email'
            }
            inputMode={
              modoCambio ? 'numeric' : undefined
            }
            value={
              modoCambio ? codigo : correo
            }
            onChange={(e) =>
              modoCambio
                ? manejarCambioCodigo(e)
                : manejarCambioCorreo(e)
            }
            placeholder={
              modoCambio
                ? '000000'
                : 'tu@correo.com'
            }
            maxLength={
              modoCambio ? 6 : 100
            }
            error={
              modoCambio
                ? errorCodigo
                : error
            }
            modoOscuro={modoOscuro}
          />

          {modoCambio && (
            <>
              <Input
                label="Nueva contraseña"
                name="nuevaContrasena"
                type="password"
                value={nuevaContrasena}
                onChange={
                  manejarCambioContrasena
                }
                placeholder="Mínimo 6 caracteres"
                maxLength={72}
                error={errorContrasena}
                modoOscuro={modoOscuro}
              />

              <Input
                label="Confirmar nueva contraseña"
                name="confirmarContrasena"
                type="password"
                value={confirmarContrasena}
                onChange={
                  manejarCambioConfirmacion
                }
                placeholder="Repite la contraseña"
                maxLength={72}
                error={errorConfirmacion}
                modoOscuro={modoOscuro}
              />
            </>
          )}

          {/* Mensaje de éxito */}
          {mensaje && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                modoOscuro
                  ? 'border-blue-800 bg-blue-950/40 text-blue-300'
                  : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}
            >
              {mensaje}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cargando
              ? 'Procesando...'
              : modoCambio
              ? 'Cambiar contraseña'
              : 'Generar código'}
          </button>
        </form>

        {/* Regresar al Login */}
        <div className="mt-6 text-center sm:mt-7">
          <Link
            to="/login"
            className={`text-sm font-semibold transition-colors ${
              modoOscuro
                ? 'text-slate-300 hover:text-blue-400'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            ← Regresar al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RecoverPassword