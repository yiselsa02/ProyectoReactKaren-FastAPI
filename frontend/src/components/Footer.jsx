import { Link } from 'react-router-dom'

import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'

function Footer({ modoOscuro }) {
  const enlacesExplorar = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Productos', ruta: '/productos' },
    { nombre: 'Quiénes somos', ruta: '/quienes-somos' },
    { nombre: 'Contacto', ruta: '/contacto' },
  ]

  const estiloEnlace = `text-sm transition-colors duration-200 ${
    modoOscuro
      ? 'text-slate-400 hover:text-blue-400'
      : 'text-gray-500 hover:text-blue-600'
  }`

  const estiloRed = `flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-600 hover:text-white ${
    modoOscuro
      ? 'border-slate-700 bg-[#121d2e] text-slate-400'
      : 'border-gray-200 bg-gray-50 text-gray-500'
  }`

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        modoOscuro
          ? 'border-slate-800 bg-[#08111f]'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* CONTENIDO */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* MARCA */}
          <div className="text-center sm:text-left">

            <Link
              to="/"
              aria-label="CellWorld - Inicio"
              className="group inline-flex flex-col items-center sm:items-start"
            >
              <img
                src={modoOscuro ? logoDark : logo}
                alt="CellWorld"
                className="h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-105"
              />

              <span
                className={`mt-1 text-[10px] font-bold tracking-[2px] transition-colors duration-200 ${
                  modoOscuro
                    ? 'text-slate-500 group-hover:text-blue-400'
                    : 'text-gray-400 group-hover:text-blue-600'
                }`}
              >
                TECNOLOGÍA
              </span>
            </Link>

            <p
              className={`mx-auto mt-3 max-w-xs text-sm leading-6 sm:mx-0 ${
                modoOscuro
                  ? 'text-slate-400'
                  : 'text-gray-500'
              }`}
            >
              Descubre diferentes celulares, conoce sus
              características y encuentra la opción ideal para ti.
            </p>

            {/* REDES */}
            <div className="mt-4 flex justify-center gap-2 sm:justify-start">

              <a
                href="#"
                aria-label="Facebook"
                className={estiloRed}
              >
                f
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className={estiloRed}
              >
                ◎
              </a>

              <a
                href="#"
                aria-label="TikTok"
                className={estiloRed}
              >
                ♪
              </a>

              <a
                href="#"
                aria-label="X"
                className={estiloRed}
              >
                𝕏
              </a>

            </div>
          </div>

          {/* EXPLORAR */}
          <div className="text-center sm:text-left">

            <h3
              className={`mb-4 text-sm font-bold uppercase tracking-wider ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Explorar
            </h3>

            <ul className="space-y-3">

              {enlacesExplorar.map((enlace) => (
                <li key={enlace.ruta}>
                  <Link
                    to={enlace.ruta}
                    className={estiloEnlace}
                  >
                    {enlace.nombre}
                  </Link>
                </li>
              ))}

            </ul>
          </div>

          {/* INFORMACIÓN */}
          <div className="text-center sm:text-left">

            <h3
              className={`mb-4 text-sm font-bold uppercase tracking-wider ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Información
            </h3>

            <ul className="space-y-3">

              <li>
                <Link
                  to="/quienes-somos"
                  className={estiloEnlace}
                >
                  Sobre nosotros
                </Link>
              </li>

              <li>
                <a href="#" className={estiloEnlace}>
                  Preguntas frecuentes
                </a>
              </li>

              <li>
                <a href="#" className={estiloEnlace}>
                  Términos y condiciones
                </a>
              </li>

              <li>
                <a href="#" className={estiloEnlace}>
                  Política de privacidad
                </a>
              </li>

            </ul>
          </div>

          {/* CONTACTO */}
          <div className="text-center sm:text-left">

            <h3
              className={`mb-4 text-sm font-bold uppercase tracking-wider ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Contáctanos
            </h3>

            <div className="space-y-4">

              {/* CORREO */}
              <div className="flex items-start justify-center gap-3 sm:justify-start">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                  @
                </div>

                <div className="min-w-0 text-left">
                  <p
                    className={`text-xs font-semibold ${
                      modoOscuro
                        ? 'text-slate-300'
                        : 'text-gray-700'
                    }`}
                  >
                    Correo
                  </p>

                  <a
                    href="mailto:contacto@cellworld.com"
                    className="break-all text-sm text-blue-600 hover:underline"
                  >
                    contacto@cellworld.com
                  </a>
                </div>

              </div>

              {/* TELÉFONO */}
              <div className="flex items-start justify-center gap-3 sm:justify-start">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-600">
                  ☎
                </div>

                <div className="text-left">
                  <p
                    className={`text-xs font-semibold ${
                      modoOscuro
                        ? 'text-slate-300'
                        : 'text-gray-700'
                    }`}
                  >
                    Teléfono
                  </p>

                  <a
                    href="tel:+573000000000"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    +57 300 000 0000
                  </a>
                </div>

              </div>

              {/* UBICACIÓN */}
              <div className="flex items-start justify-center gap-3 sm:justify-start">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-600">
                  ●
                </div>

                <div className="text-left">
                  <p
                    className={`text-xs font-semibold ${
                      modoOscuro
                        ? 'text-slate-300'
                        : 'text-gray-700'
                    }`}
                  >
                    Ubicación
                  </p>

                  <p
                    className={`text-sm ${
                      modoOscuro
                        ? 'text-slate-400'
                        : 'text-gray-500'
                    }`}
                  >
                    Colombia
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* SEPARADOR */}
        <div
          className={`my-6 border-t ${
            modoOscuro
              ? 'border-slate-800'
              : 'border-gray-200'
          }`}
        />

        {/* PARTE INFERIOR */}
        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

          <p
            className={`text-xs ${
              modoOscuro
                ? 'text-slate-500'
                : 'text-gray-400'
            }`}
          >
            © 2026 CellWorld. Todos los derechos reservados.
          </p>

          <div className="flex gap-5">

            <a
              href="#"
              className={`text-xs transition-colors hover:text-blue-600 ${
                modoOscuro
                  ? 'text-slate-500'
                  : 'text-gray-400'
              }`}
            >
              Privacidad
            </a>

            <a
              href="#"
              className={`text-xs transition-colors hover:text-blue-600 ${
                modoOscuro
                  ? 'text-slate-500'
                  : 'text-gray-400'
              }`}
            >
              Términos
            </a>

            <a
              href="#"
              className={`text-xs transition-colors hover:text-blue-600 ${
                modoOscuro
                  ? 'text-slate-500'
                  : 'text-gray-400'
              }`}
            >
              Ayuda
            </a>

          </div>
        </div>
      </div>

      {/* BARRA FINAL */}
      <div
        className={`border-t ${
          modoOscuro
            ? 'border-slate-800 bg-[#060d17]'
            : 'border-gray-100 bg-gray-50'
        }`}
      >
        <p
          className={`px-4 py-3 text-center text-xs ${
            modoOscuro
              ? 'text-slate-600'
              : 'text-gray-400'
          }`}
        >
          Tecnología para encontrar lo que buscas.
        </p>
      </div>
    </footer>
  )
}

export default Footer