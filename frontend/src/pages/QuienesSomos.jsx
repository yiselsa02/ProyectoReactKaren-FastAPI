import {
  Target,
  Eye,
  Smartphone,
  Tags,
  Headset,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Zap,
  Users,
} from 'lucide-react'

import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'

function QuienesSomos({ modoOscuro }) {
  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-500 ${
        modoOscuro
          ? 'bg-[#0b1422]'
          : 'bg-slate-50'
      }`}
    >

      {/* ================================================== */}
      {/* FONDO TECNOLÓGICO */}
      {/* ================================================== */}

      <div
        className={`pointer-events-none absolute inset-0 ${
          modoOscuro ? 'opacity-[0.08]' : 'opacity-[0.10]'
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

      {/* ================================================== */}
      {/* BRILLOS DECORATIVOS */}
      {/* ================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className={`absolute -left-24 top-20 h-72 w-72 rounded-full blur-3xl ${
            modoOscuro
              ? 'bg-blue-900/15'
              : 'bg-blue-200/20'
          }`}
        />

        <div
          className={`absolute -right-24 bottom-20 h-72 w-72 rounded-full blur-3xl ${
            modoOscuro
              ? 'bg-blue-800/10'
              : 'bg-blue-100/25'
          }`}
        />

      </div>

      {/* ================================================== */}
      {/* CONTENIDO */}
      {/* ================================================== */}

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">

        {/* ================================================== */}
        {/* PRESENTACIÓN PRINCIPAL */}
        {/* ================================================== */}

        <section
          className={`mb-8 overflow-hidden rounded-3xl border ${
            modoOscuro
              ? 'border-slate-700 bg-[#121d2e]/95'
              : 'border-gray-200 bg-white/95'
          }`}
        >

          <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">

            {/* ================================================== */}
            {/* LOGO */}
            {/* ================================================== */}

            <div
              className={`flex min-h-[380px] items-center justify-center p-8 md:p-10 ${
                modoOscuro
                  ? 'bg-[#0f1b2d]'
                  : 'bg-slate-50'
              }`}
            >

              <div className="flex h-full min-h-[330px] w-full items-center justify-center rounded-2xl">

                <img
                  src={modoOscuro ? logoDark : logo}
                  alt="Logo de CellWorld"
                  className="h-[310px] w-[310px] max-w-full object-contain md:h-[360px] md:w-[360px]"
                />

              </div>

            </div>

            {/* ================================================== */}
            {/* INFORMACIÓN */}
            {/* ================================================== */}

            <div className="flex flex-col justify-center p-8 md:p-12">

              <p className="mb-3 text-sm font-extrabold tracking-[2px] text-blue-600">
                SOBRE CELLWORLD
              </p>

              <h1
                className={`mb-5 text-3xl font-bold leading-tight md:text-4xl ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Tecnología que se adapta a ti
              </h1>

              <p
                className={`mb-5 text-base leading-7 ${
                  modoOscuro
                    ? 'text-slate-300'
                    : 'text-gray-600'
                }`}
              >
                CellWorld es una tienda especializada en celulares y
                tecnología, creada para ayudarte a encontrar el dispositivo
                que mejor se adapte a tus necesidades.
              </p>

              <p
                className={`mb-7 text-base leading-7 ${
                  modoOscuro
                    ? 'text-slate-400'
                    : 'text-gray-500'
                }`}
              >
                Nuestra plataforma reúne diferentes marcas, modelos y
                características en un solo lugar, haciendo que comparar
                opciones y conocer nuevos dispositivos sea mucho más
                sencillo.
              </p>

              <div className="flex flex-wrap gap-3">

                <span
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    modoOscuro
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      : 'border-blue-200 bg-blue-50 text-blue-600'
                  }`}
                >
                  Tecnología
                </span>

                <span
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    modoOscuro
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      : 'border-blue-200 bg-blue-50 text-blue-600'
                  }`}
                >
                  Variedad
                </span>

                <span
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    modoOscuro
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      : 'border-blue-200 bg-blue-50 text-blue-600'
                  }`}
                >
                  Confianza
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* INTRODUCCIÓN */}
        {/* ================================================== */}

        <section
          className={`mb-8 rounded-3xl border p-8 md:p-10 ${
            modoOscuro
              ? 'border-slate-700 bg-[#121d2e]/95'
              : 'border-gray-200 bg-white/95'
          }`}
        >

          <div className="mx-auto max-w-4xl text-center">

            <p className="mb-3 text-sm font-extrabold tracking-[2px] text-blue-600">
              NUESTRA HISTORIA
            </p>

            <h2
              className={`mb-5 text-2xl font-bold md:text-3xl ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Una tienda pensada para hacer más fácil tu elección
            </h2>

            <p
              className={`leading-7 ${
                modoOscuro
                  ? 'text-slate-300'
                  : 'text-gray-600'
              }`}
            >
              CellWorld nace con la idea de reunir en un mismo espacio
              diferentes alternativas de celulares y facilitar el proceso
              de búsqueda. Queremos que nuestros usuarios puedan conocer
              las características de cada dispositivo, comparar diferentes
              opciones y tomar una decisión de compra con mayor confianza.
            </p>

          </div>

        </section>

        {/* ================================================== */}
        {/* MISIÓN Y VISIÓN */}
        {/* ================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* MISIÓN */}

          <article
            className={`rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              modoOscuro
                ? 'border-slate-700 bg-[#121d2e]/95 hover:border-blue-500'
                : 'border-gray-200 bg-white/95 hover:border-blue-300'
            }`}
          >

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Target size={25} strokeWidth={2} />
            </div>

            <h2
              className={`mb-3 text-2xl font-bold ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Nuestra misión
            </h2>

            <p
              className={`leading-7 ${
                modoOscuro
                  ? 'text-slate-300'
                  : 'text-gray-600'
              }`}
            >
              Ofrecer celulares de diferentes marcas y brindar una
              experiencia sencilla, clara y confiable, ayudando a nuestros
              clientes a encontrar una opción que se adapte a sus
              necesidades y presupuesto.
            </p>

          </article>

          {/* VISIÓN */}

          <article
            className={`rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              modoOscuro
                ? 'border-slate-700 bg-[#121d2e]/95 hover:border-blue-500'
                : 'border-gray-200 bg-white/95 hover:border-blue-300'
            }`}
          >

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Eye size={25} strokeWidth={2} />
            </div>

            <h2
              className={`mb-3 text-2xl font-bold ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Nuestra visión
            </h2>

            <p
              className={`leading-7 ${
                modoOscuro
                  ? 'text-slate-300'
                  : 'text-gray-600'
              }`}
            >
              Buscamos crecer como una plataforma reconocida por su
              variedad de productos, información clara, facilidad de uso
              y atención cercana a nuestros clientes.
            </p>

          </article>

        </div>

        {/* ================================================== */}
        {/* VALORES */}
        {/* ================================================== */}

        <section
          className={`mb-8 rounded-3xl border p-8 md:p-10 ${
            modoOscuro
              ? 'border-slate-700 bg-[#121d2e]/95'
              : 'border-gray-200 bg-white/95'
          }`}
        >

          <div className="mb-8 text-center">

            <p className="mb-2 text-sm font-extrabold tracking-[2px] text-blue-600">
              NUESTROS VALORES
            </p>

            <h2
              className={`text-2xl font-bold md:text-3xl ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Lo que representa CellWorld
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* CONFIANZA */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <ShieldCheck size={22} />
              </div>

              <h3
                className={`mb-2 font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Confianza
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-400'
                    : 'text-gray-500'
                }`}
              >
                Buscamos ofrecer información clara para que puedas elegir
                con seguridad.
              </p>

            </article>

            {/* CALIDAD */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Zap size={22} />
              </div>

              <h3
                className={`mb-2 font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Calidad
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-400'
                    : 'text-gray-500'
                }`}
              >
                Seleccionamos diferentes alternativas para ofrecer variedad
                y buenas opciones.
              </p>

            </article>

            {/* CLIENTE */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users size={22} />
              </div>

              <h3
                className={`mb-2 font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Cercanía
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-400'
                    : 'text-gray-500'
                }`}
              >
                Queremos que nuestros clientes encuentren una experiencia
                sencilla y agradable.
              </p>

            </article>

            {/* INNOVACIÓN */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Smartphone size={22} />
              </div>

              <h3
                className={`mb-2 font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Tecnología
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-400'
                    : 'text-gray-500'
                }`}
              >
                Nos enfocamos en acercar las nuevas opciones tecnológicas
                a nuestros usuarios.
              </p>

            </article>

          </div>

        </section>

        {/* ================================================== */}
        {/* LO QUE OFRECEMOS */}
        {/* ================================================== */}

        <section
          className={`mb-8 rounded-3xl border p-8 md:p-10 ${
            modoOscuro
              ? 'border-slate-700 bg-[#121d2e]/95'
              : 'border-gray-200 bg-white/95'
          }`}
        >

          <div className="mb-8">

            <p className="mb-2 text-sm font-extrabold tracking-[2px] text-blue-600">
              NUESTRA TIENDA
            </p>

            <h2
              className={`text-2xl font-bold md:text-3xl ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Todo lo que encontrarás en CellWorld
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* CELULARES */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Smartphone size={22} />
              </div>

              <h3
                className={`mb-2 text-lg font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Celulares
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-300'
                    : 'text-gray-600'
                }`}
              >
                Encuentra diferentes modelos y características para
                comparar y elegir.
              </p>

            </article>

            {/* MARCAS */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Tags size={22} />
              </div>

              <h3
                className={`mb-2 text-lg font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Diferentes marcas
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-300'
                    : 'text-gray-600'
                }`}
              >
                Samsung, iPhone, Motorola, Xiaomi, Huawei, Honor y otras
                alternativas.
              </p>

            </article>

            {/* ATENCIÓN */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Headset size={22} />
              </div>

              <h3
                className={`mb-2 text-lg font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Atención al cliente
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-300'
                    : 'text-gray-600'
                }`}
              >
                Estamos disponibles para ayudarte y resolver tus dudas
                sobre nuestros productos.
              </p>

            </article>

            {/* COMPRA */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <ShoppingBag size={22} />
              </div>

              <h3
                className={`mb-2 text-lg font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Compra sencilla
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-300'
                    : 'text-gray-600'
                }`}
              >
                Una plataforma organizada para que puedas encontrar
                rápidamente lo que buscas.
              </p>

            </article>

            {/* EXPERIENCIA */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Heart size={22} />
              </div>

              <h3
                className={`mb-2 text-lg font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Experiencia agradable
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-300'
                    : 'text-gray-600'
                }`}
              >
                Diseñamos nuestra página pensando en que navegar sea
                cómodo y fácil.
              </p>

            </article>

            {/* INFORMACIÓN */}

            <article
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                modoOscuro
                  ? 'border-slate-700 bg-[#17263c] hover:border-blue-500'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white'
              }`}
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Target size={22} />
              </div>

              <h3
                className={`mb-2 text-lg font-bold ${
                  modoOscuro
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                Información clara
              </h3>

              <p
                className={`text-sm leading-6 ${
                  modoOscuro
                    ? 'text-slate-300'
                    : 'text-gray-600'
                }`}
              >
                Consulta especificaciones y características de los
                dispositivos de manera sencilla.
              </p>

            </article>

          </div>

        </section>

        {/* ================================================== */}
        {/* CIERRE */}
        {/* ================================================== */}

        <section
          className={`rounded-3xl border p-8 text-center md:p-12 ${
            modoOscuro
              ? 'border-slate-700 bg-[#121d2e]/95'
              : 'border-gray-200 bg-white/95'
          }`}
        >

          <Heart
            className="mx-auto mb-5 text-blue-600"
            size={38}
            strokeWidth={1.8}
          />

          <h2
            className={`mb-4 text-2xl font-bold md:text-3xl ${
              modoOscuro
                ? 'text-white'
                : 'text-gray-900'
            }`}
          >
            Gracias por visitar CellWorld
          </h2>

          <p
            className={`mx-auto max-w-2xl leading-7 ${
              modoOscuro
                ? 'text-slate-400'
                : 'text-gray-500'
            }`}
          >
            Esperamos ayudarte a encontrar el celular que estás buscando
            y ofrecerte una experiencia sencilla, clara y agradable.
          </p>

        </section>

      </section>

    </div>
  )
}

export default QuienesSomos