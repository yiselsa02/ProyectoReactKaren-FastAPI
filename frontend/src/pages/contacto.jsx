import { useState } from 'react'
import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'
import whatsapp from '../assets/whatsapp.png'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

function Contacto({ modoOscuro }) {
  const [mensajeEnviado, setMensajeEnviado] = useState(false)
  const [tipo, setTipo] = useState('Petición')
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const obtenerUsuarioCliente = () => {
    try {
      const usuario = JSON.parse(
        localStorage.getItem('usuario') || 'null'
      )

      const rol = Number(
        usuario?.rol_id ??
        usuario?.id_rol ??
        usuario?.rol?.id_rol ??
        usuario?.rol
      )

      return rol === 2 ? usuario : null
    } catch {
      return null
    }
  }

  const esCliente = Boolean(obtenerUsuarioCliente())

  const obtenerMensajeError = (data) => {
    if (!data) return 'No se pudo enviar la PQR.'

    if (typeof data === 'string') return data

    if (Array.isArray(data)) {
      return data
        .map((item) => obtenerMensajeError(item))
        .filter(Boolean)
        .join(', ')
    }

    if (typeof data === 'object') {
      if (typeof data.msg === 'string' && Array.isArray(data.loc)) {
        const campo = data.loc[data.loc.length - 1]
        return `${campo}: ${data.msg}`
      }

      if (typeof data.detail === 'string') return data.detail
      if (typeof data.message === 'string') return data.message
      if (typeof data.error === 'string') return data.error
      if (typeof data.msg === 'string') return data.msg

      if (data.detail) return obtenerMensajeError(data.detail)
      if (data.message) return obtenerMensajeError(data.message)
      if (data.msg) return obtenerMensajeError(data.msg)

      return 'No se pudo enviar la PQR. Revisa los datos e inténtalo nuevamente.'
    }

    return String(data)
  }

  const manejarEnvio = async (event) => {
    event.preventDefault()

    setMensajeEnviado(false)
    setError('')

    if (!esCliente) {
      alert(
        'Las PQR solo pueden ser enviadas por clientes que hayan iniciado sesión.'
      )
      return
    }

    setEnviando(true)

    try {
      const respuesta = await fetch(
        `${API_URL}/api/pqr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            tipo,
            asunto,
            descripcion,
          }),
        }
      )

      const data = await respuesta
        .json()
        .catch(() => null)

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(data)
        )
      }

      setTipo('Petición')
      setAsunto('')
      setDescripcion('')
      setMensajeEnviado(true)
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : obtenerMensajeError(error)

      setError(
        String(mensaje || 'No se pudo enviar la PQR.')
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-300 ${
        modoOscuro
          ? 'bg-[#0b1422]'
          : 'bg-slate-50'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          modoOscuro
            ? 'opacity-[0.10]'
            : 'opacity-[0.08]'
        }`}
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              rgb(37 99 235) 0px,
              rgb(37 99 235) 1.5px,
              transparent 1.5px,
              transparent 32px
            ),
            repeating-linear-gradient(
              -45deg,
              rgb(37 99 235) 0px,
              rgb(37 99 235) 1.5px,
              transparent 1.5px,
              transparent 32px
            )
          `,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -left-20 top-20 h-72 w-72 rounded-full blur-3xl ${
            modoOscuro
              ? 'bg-blue-900/15'
              : 'bg-blue-200/20'
          }`}
        />

        <div
          className={`absolute -right-20 bottom-20 h-72 w-72 rounded-full blur-3xl ${
            modoOscuro
              ? 'bg-blue-800/10'
              : 'bg-blue-100/25'
          }`}
        />
      </div>

      <section className="relative z-10 mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-10 text-center">
          <img
            src={modoOscuro ? logoDark : logo}
            alt="CellWorld"
            className="mx-auto mb-5 h-20 w-20 object-contain"
          />

          <p className="mb-3 text-sm font-bold tracking-[2px] text-blue-600">
            ESTAMOS PARA AYUDARTE
          </p>

          <h1
            className={`mb-4 text-3xl font-bold md:text-4xl ${
              modoOscuro
                ? 'text-white'
                : 'text-gray-900'
            }`}
          >
            Contáctanos
          </h1>

          <p
            className={`mx-auto max-w-2xl leading-7 ${
              modoOscuro
                ? 'text-slate-300'
                : 'text-gray-600'
            }`}
          >
            ¿Tienes alguna pregunta o quieres conocer más
            sobre nuestros celulares? Escríbenos y estaremos
            encantados de ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
          <div
            className={`rounded-2xl border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-9 ${
              modoOscuro
                ? 'border-slate-700 bg-[#121d2e]/95'
                : 'border-gray-200 bg-white/95'
            }`}
          >
            <h2
              className={`mb-7 text-2xl font-bold ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Información de contacto
            </h2>

            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 ${
                  modoOscuro
                    ? 'border-slate-700 bg-[#17263c]'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p
                  className={`mb-1 text-sm font-semibold ${
                    modoOscuro
                      ? 'text-slate-300'
                      : 'text-gray-500'
                  }`}
                >
                  Correo
                </p>

                <a
                  href="mailto:contacto@cellworld.com"
                  className="font-medium text-blue-600 hover:underline"
                >
                  contacto@cellworld.com
                </a>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  modoOscuro
                    ? 'border-slate-700 bg-[#17263c]'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p
                  className={`mb-1 text-sm font-semibold ${
                    modoOscuro
                      ? 'text-slate-300'
                      : 'text-gray-500'
                  }`}
                >
                  Teléfono
                </p>

                <a
                  href="tel:+573342732344"
                  className={`font-medium ${
                    modoOscuro
                      ? 'text-white hover:text-blue-400'
                      : 'text-gray-900 hover:text-blue-600'
                  }`}
                >
                  +57 334 273 2344
                </a>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  modoOscuro
                    ? 'border-slate-700 bg-[#17263c]'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p
                  className={`mb-1 text-sm font-semibold ${
                    modoOscuro
                      ? 'text-slate-300'
                      : 'text-gray-500'
                  }`}
                >
                  Ubicación
                </p>

                <p
                  className={`font-medium ${
                    modoOscuro
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  Colombia
                </p>
              </div>

              <a
                href="https://wa.me/573342732344"
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-5 rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  modoOscuro
                    ? 'border-blue-500/30 bg-blue-500/10 hover:border-blue-400 hover:bg-blue-500/15'
                    : 'border-green-200 bg-green-50 hover:border-green-400'
                }`}
              >
                <img
                  src={whatsapp}
                  alt="WhatsApp"
                  className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110"
                />

                <div>
                  <p
                    className={`text-lg font-bold ${
                      modoOscuro
                        ? 'text-blue-400'
                        : 'text-green-700'
                    }`}
                  >
                    WhatsApp
                  </p>

                  <p
                    className={
                      modoOscuro
                        ? 'text-sm text-blue-300'
                        : 'text-sm text-green-600'
                    }
                  >
                    +57 334 273 2344
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      modoOscuro
                        ? 'text-blue-300'
                        : 'text-green-600'
                    }`}
                  >
                    Escríbenos directamente →
                  </p>
                </div>
              </a>
            </div>
          </div>

          <form
            onSubmit={manejarEnvio}
            className={`rounded-2xl border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-9 ${
              modoOscuro
                ? 'border-slate-700 bg-[#121d2e]/95'
                : 'border-gray-200 bg-white/95'
            }`}
          >
            <h2
              className={`mb-3 text-2xl font-bold ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Envía una PQR
            </h2>

            <p
              className={`mb-7 text-sm ${
                modoOscuro
                  ? 'text-slate-400'
                  : 'text-gray-500'
              }`}
            >
              Las peticiones, quejas, reclamos y sugerencias
              solo pueden ser enviadas por clientes con sesión iniciada.
            </p>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="tipo"
                  className={`mb-2 block text-sm font-semibold ${
                    modoOscuro
                      ? 'text-slate-200'
                      : 'text-gray-700'
                  }`}
                >
                  Tipo de solicitud
                </label>

                <select
                  id="tipo"
                  value={tipo}
                  disabled={!esCliente || enviando}
                  onChange={(event) =>
                    setTipo(event.target.value)
                  }
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                    modoOscuro
                      ? 'border-slate-700 bg-[#17263c] text-white'
                      : 'border-gray-200 bg-gray-50/70 text-gray-900'
                  }`}
                >
                  <option value="Petición">Petición</option>
                  <option value="Queja">Queja</option>
                  <option value="Reclamo">Reclamo</option>
                  <option value="Sugerencia">Sugerencia</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="asunto"
                  className={`mb-2 block text-sm font-semibold ${
                    modoOscuro
                      ? 'text-slate-200'
                      : 'text-gray-700'
                  }`}
                >
                  Asunto
                </label>

                <input
                  id="asunto"
                  required
                  value={asunto}
                  disabled={!esCliente || enviando}
                  onChange={(event) =>
                    setAsunto(event.target.value)
                  }
                  placeholder="Resume tu solicitud"
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                    modoOscuro
                      ? 'border-slate-700 bg-[#17263c] text-white placeholder:text-slate-400'
                      : 'border-gray-200 bg-gray-50/70 text-gray-900 placeholder:text-gray-400'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="descripcion"
                  className={`mb-2 block text-sm font-semibold ${
                    modoOscuro
                      ? 'text-slate-200'
                      : 'text-gray-700'
                  }`}
                >
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  required
                  rows="5"
                  value={descripcion}
                  disabled={!esCliente || enviando}
                  onChange={(event) =>
                    setDescripcion(event.target.value)
                  }
                  placeholder="Cuéntanos los detalles de tu solicitud..."
                  className={`w-full resize-none rounded-xl border px-4 py-3 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                    modoOscuro
                      ? 'border-slate-700 bg-[#17263c] text-white placeholder:text-slate-400'
                      : 'border-gray-200 bg-gray-50/70 text-gray-900 placeholder:text-gray-400'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={!esCliente || enviando}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {enviando
                  ? 'Enviando PQR...'
                  : 'Enviar PQR'}
              </button>

              {mensajeEnviado && (
                <p className="text-center text-sm font-semibold text-green-500">
                  PQR enviada correctamente. Un administrador
                  la revisará pronto.
                </p>
              )}

              {error && (
                <p className="text-center text-sm font-semibold text-red-500">
                  {error}
                </p>
              )}

              {!esCliente && (
                <p
                  className={`text-center text-sm ${
                    modoOscuro
                      ? 'text-amber-300'
                      : 'text-amber-700'
                  }`}
                >
                  Este formulario solo está disponible para
                  clientes con sesión iniciada.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Contacto