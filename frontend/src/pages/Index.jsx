import { Link } from 'react-router-dom'

import Carrusel from '../components/carrusel'
import Button from '../components/button'

function Index({ modoOscuro }) {
  const claseTitulo = modoOscuro
    ? 'text-white'
    : 'text-gray-900'

  const claseTexto = modoOscuro
    ? 'text-slate-400'
    : 'text-gray-500'

  const claseTarjeta = modoOscuro
    ? 'border-slate-700 bg-[#121d2e] hover:border-blue-500'
    : 'border-gray-200 bg-white hover:border-blue-300'

  const claseTarjetaInterna = modoOscuro
    ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
    : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'

  return (
    <main
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-300 ${
        modoOscuro
          ? 'bg-[#0b1422]'
          : 'bg-slate-50'
      }`}
    >

      {/* ================================================== */}
      {/* FONDO TECNOLÓGICO */}
      {/* ================================================== */}

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          modoOscuro
            ? 'opacity-[0.08]'
            : 'opacity-[0.10]'
        }`}
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              rgb(37 99 235) 0px,
              rgb(37 99 235) 1px,
              transparent 1px,
              transparent 32px
            ),
            repeating-linear-gradient(
              -45deg,
              rgb(37 99 235) 0px,
              rgb(37 99 235) 1px,
              transparent 1px,
              transparent 32px
            )
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Brillo decorativo */}

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-3xl ${
          modoOscuro
            ? 'bg-blue-600/10'
            : 'bg-blue-400/10'
        }`}
      />

      {/* ================================================== */}
      {/* CONTENIDO */}
      {/* ================================================== */}

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-10 md:px-6">

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <section className="mx-auto mb-14 max-w-4xl text-center">

          {/* Etiqueta */}

          <div
            className={`mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${
              modoOscuro
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                : 'border-blue-200 bg-blue-50 text-blue-600'
            }`}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
            />

            TECNOLOGÍA AL ALCANCE DE TODOS
          </div>

          {/* Título */}

          <h1
            className={`mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl ${claseTitulo}`}
          >
            Encuentra el celular

            <span className="block text-blue-600">
              perfecto para ti
            </span>
          </h1>

          {/* Descripción */}

          <p
            className={`mx-auto max-w-2xl text-base leading-7 md:text-lg ${
              modoOscuro
                ? 'text-slate-300'
                : 'text-gray-500'
            }`}
          >
            Explora celulares de diferentes marcas, compara sus
            características y descubre nuevas opciones tecnológicas
            en un solo lugar.
          </p>

          {/* Botón */}

          <div className="mt-8 flex justify-center">
            <Button to="/productos">
              Explorar celulares →
            </Button>
          </div>

        </section>

        {/* ================================================== */}
        {/* CARRUSEL */}
        {/* ================================================== */}

        <section className="mb-16">
          <Carrusel />
        </section>

        {/* ================================================== */}
        {/* CATEGORÍAS */}
        {/* ================================================== */}

        <section className="mb-16">

          <div className="mb-7">

            <p className="mb-2 text-xs font-extrabold tracking-[2px] text-blue-600">
              EXPLORA
            </p>

            <h2
              className={`text-2xl font-bold md:text-3xl ${claseTitulo}`}
            >
              Encuentra lo que necesitas
            </h2>

            <p className={`mt-2 max-w-2xl text-sm ${claseTexto}`}>
              Descubre diferentes categorías y encuentra productos
              que se adapten a tus necesidades.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* CELULARES */}

            <Link
              to="/productos"
              className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${claseTarjeta}`}
            >

              <div
                aria-hidden="true"
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100"
              >
                <div className="relative h-7 w-4 rounded-[4px] border-2 border-blue-600">
                  <div className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-600" />

                  <div className="absolute bottom-1 left-1/2 h-0.5 w-2 -translate-x-1/2 rounded-full bg-blue-600" />
                </div>
              </div>

              <h3 className={`mb-1 font-bold ${claseTitulo}`}>
                Celulares
              </h3>

              <p className={`text-sm ${claseTexto}`}>
                Encuentra diferentes modelos y marcas.
              </p>

              <span className="mt-4 block text-sm font-bold text-blue-600 transition-transform duration-300 group-hover:translate-x-1">
                Explorar →
              </span>

            </Link>

            {/* AUDIO */}

            <article
              className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${claseTarjeta}`}
            >

              <div
                aria-hidden="true"
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100"
              >
                <div className="relative h-7 w-7">
                  <div className="absolute left-1/2 top-0 h-6 w-6 -translate-x-1/2 rounded-t-full border-2 border-blue-600 border-b-0" />

                  <div className="absolute bottom-0 left-0 h-4 w-2.5 rounded-b-md bg-blue-600" />

                  <div className="absolute bottom-0 right-0 h-4 w-2.5 rounded-b-md bg-blue-600" />
                </div>
              </div>

              <h3 className={`mb-1 font-bold ${claseTitulo}`}>
                Audio
              </h3>

              <p className={`text-sm ${claseTexto}`}>
                Audífonos y dispositivos para disfrutar tu música.
              </p>

              <span className="mt-4 block text-sm font-bold text-blue-600">
                Próximamente
              </span>

            </article>

            {/* ACCESORIOS */}

            <article
              className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${claseTarjeta}`}
            >

              <div
                aria-hidden="true"
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100"
              >
                <div className="relative h-7 w-7">

                  <div className="absolute left-1/2 top-0 h-4 w-2 -translate-x-1/2 rounded-t-sm bg-blue-600" />

                  <div className="absolute bottom-0 left-1/2 h-4 w-5 -translate-x-1/2 rounded-b-md border-2 border-blue-600 border-t-0" />

                  <div className="absolute left-1/2 top-0 h-2 w-3 -translate-x-1/2 rounded-sm border-2 border-blue-600 bg-blue-100" />

                </div>
              </div>

              <h3 className={`mb-1 font-bold ${claseTitulo}`}>
                Accesorios
              </h3>

              <p className={`text-sm ${claseTexto}`}>
                Complementos para aprovechar mejor tus dispositivos.
              </p>

              <span className="mt-4 block text-sm font-bold text-blue-600">
                Próximamente
              </span>

            </article>

            {/* OFERTAS */}

            <article
              className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${claseTarjeta}`}
            >

              <div
                aria-hidden="true"
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100"
              >
                <div className="relative h-6 w-7 rotate-[-15deg] rounded-md border-2 border-blue-600">

                  <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-blue-600" />

                  <div className="absolute bottom-1 left-1 h-0.5 w-3 rounded-full bg-blue-600" />

                </div>
              </div>

              <h3 className={`mb-1 font-bold ${claseTitulo}`}>
                Ofertas
              </h3>

              <p className={`text-sm ${claseTexto}`}>
                Descubre oportunidades y productos destacados.
              </p>

              <span className="mt-4 block text-sm font-bold text-blue-600">
                Próximamente
              </span>

            </article>

          </div>

        </section>

        {/* ================================================== */}
        {/* CELLWORLD */}
        {/* ================================================== */}

        <section
          className={`mb-16 rounded-3xl border p-7 md:p-10 ${
            modoOscuro
              ? 'border-slate-700 bg-[#121d2e]'
              : 'border-gray-200 bg-white'
          }`}
        >

          <div className="mb-10 text-center">

            <p className="mb-2 text-xs font-extrabold tracking-[2px] text-blue-600">
              CELLWORLD
            </p>

            <h2
              className={`text-2xl font-bold md:text-3xl ${claseTitulo}`}
            >
              Todo lo que necesitas para elegir mejor
            </h2>

            <p
              className={`mx-auto mt-3 max-w-2xl text-sm leading-6 ${claseTexto}`}
            >
              Conoce nuestro catálogo, compara diferentes opciones
              y descubre información útil antes de elegir tu próximo
              dispositivo.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* MARCAS */}

            <article
              className={`rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1 ${claseTarjetaInterna}`}
            >

              <div
                aria-hidden="true"
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100"
              >
                <div className="flex h-9 w-8 items-end justify-center gap-1">
                  <div className="h-5 w-2 rounded-t-sm bg-blue-600" />
                  <div className="h-8 w-2 rounded-t-sm bg-blue-600" />
                  <div className="h-6 w-2 rounded-t-sm bg-blue-600" />
                </div>
              </div>

              <h3 className={`mb-2 text-2xl font-bold ${claseTitulo}`}>
                10+
              </h3>

              <p className="mb-2 font-semibold text-blue-600">
                Marcas
              </p>

              <p className={`text-sm leading-6 ${claseTexto}`}>
                Diferentes fabricantes y propuestas tecnológicas.
              </p>

            </article>

            {/* CELULARES */}

            <Link
              to="/productos"
              className={`rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1 ${claseTarjetaInterna}`}
            >

              <div
                aria-hidden="true"
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100"
              >
                <div className="relative h-8 w-5 rounded-[5px] border-2 border-blue-600">
                  <div className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-600" />

                  <div className="absolute bottom-1 left-1/2 h-0.5 w-2 -translate-x-1/2 rounded-full bg-blue-600" />
                </div>
              </div>

              <h3 className={`mb-2 text-2xl font-bold ${claseTitulo}`}>
                10+
              </h3>

              <p className="mb-2 font-semibold text-blue-600">
                Celulares
              </p>

              <p className={`text-sm leading-6 ${claseTexto}`}>
                Modelos disponibles para explorar y comparar.
              </p>

            </Link>

            {/* INFORMACIÓN */}

            <article
              className={`rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1 ${claseTarjetaInterna}`}
            >

              <div
                aria-hidden="true"
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100"
              >
                <div className="relative h-9 w-7">
                  <div className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 rounded-full border-2 border-blue-600" />

                  <div className="absolute bottom-0 left-1/2 h-2.5 w-5 -translate-x-1/2 rounded-b-sm bg-blue-600" />
                </div>
              </div>

              <h3 className={`mb-2 text-2xl font-bold ${claseTitulo}`}>
                Fácil
              </h3>

              <p className="mb-2 font-semibold text-blue-600">
                Información clara
              </p>

              <p className={`text-sm leading-6 ${claseTexto}`}>
                Consulta las características de cada dispositivo.
              </p>

            </article>

          </div>

        </section>

        {/* ================================================== */}
        {/* BENEFICIOS */}
        {/* ================================================== */}

        <section className="mb-16">

          <div className="mb-8 text-center">

            <p className="mb-2 text-xs font-extrabold tracking-[2px] text-blue-600">
              ¿POR QUÉ CELLWORLD?
            </p>

            <h2
              className={`text-2xl font-bold md:text-3xl ${claseTitulo}`}
            >
              Una experiencia pensada para ti
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* FÁCIL DE EXPLORAR */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${claseTarjeta}`}
            >

              <div
                aria-hidden="true"
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100"
              >
                <div className="relative h-5 w-6">
                  <div className="absolute left-0 top-1/2 h-0.5 w-6 -translate-y-1/2 bg-blue-600" />

                  <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-blue-600" />
                </div>
              </div>

              <h3 className={`mb-2 font-bold ${claseTitulo}`}>
                Fácil de explorar
              </h3>

              <p className={`text-sm leading-6 ${claseTexto}`}>
                Navega por nuestro catálogo de manera rápida y sencilla.
              </p>

            </article>

            {/* INFORMACIÓN */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${claseTarjeta}`}
            >

              <div
                aria-hidden="true"
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100"
              >
                <div className="relative h-6 w-6">
                  <div className="absolute left-0 top-0 h-5 w-5 rounded-full border-2 border-blue-600" />

                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rotate-[-45deg] border-b-2 border-r-2 border-blue-600" />
                </div>
              </div>

              <h3 className={`mb-2 font-bold ${claseTitulo}`}>
                Información detallada
              </h3>

              <p className={`text-sm leading-6 ${claseTexto}`}>
                Conoce las características de los dispositivos.
              </p>

            </article>

            {/* SEGURIDAD */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${claseTarjeta}`}
            >

              <div
                aria-hidden="true"
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100"
              >
                <div className="relative h-7 w-6">
                  <div className="absolute left-1/2 top-0 h-7 w-6 -translate-x-1/2 rounded-b-xl border-2 border-blue-600" />

                  <div className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rotate-45 bg-blue-600" />
                </div>
              </div>

              <h3 className={`mb-2 font-bold ${claseTitulo}`}>
                Experiencia segura
              </h3>

              <p className={`text-sm leading-6 ${claseTexto}`}>
                Una plataforma diseñada pensando en tu comodidad.
              </p>

            </article>

            {/* SOPORTE */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${claseTarjeta}`}
            >

              <div
                aria-hidden="true"
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100"
              >
                <div className="relative h-6 w-7 rounded-md border-2 border-blue-600">

                  <div className="absolute bottom-[-5px] left-2 h-2 w-2 rotate-45 border-b-2 border-r-2 border-blue-600 bg-blue-100" />

                  <div className="absolute left-1.5 top-1/2 h-0.5 w-1 rounded-full bg-blue-600" />

                  <div className="absolute left-3 top-1/2 h-0.5 w-1 rounded-full bg-blue-600" />

                  <div className="absolute left-4.5 top-1/2 h-0.5 w-1 rounded-full bg-blue-600" />

                </div>
              </div>

              <h3 className={`mb-2 font-bold ${claseTitulo}`}>
                Soporte
              </h3>

              <p className={`text-sm leading-6 ${claseTexto}`}>
                Estamos aquí para ayudarte cuando lo necesites.
              </p>

            </article>

          </div>

        </section>

        {/* ================================================== */}
        {/* CTA FINAL */}
        {/* ================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 text-center md:p-12">

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/10"
          />

          <div className="relative z-10">

            <p className="mb-3 text-xs font-extrabold tracking-[2px] text-blue-100">
              CELLWORLD
            </p>

            <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
              ¿Listo para encontrar tu próximo celular?
            </h2>

            <p className="mx-auto mb-7 max-w-xl text-sm leading-6 text-blue-100">
              Explora nuestro catálogo y descubre diferentes opciones
              para encontrar el dispositivo que más se adapte a ti.
            </p>

            <div className="flex justify-center">
              <Button
                to="/productos"
                variante="outline"
              >
                Explorar celulares →
              </Button>
            </div>

          </div>

        </section>

      </div>

    </main>
  )
}

export default Index