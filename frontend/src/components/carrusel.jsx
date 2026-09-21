import { useEffect, useState } from 'react'

import vivo from '../assets/vivo.jpg'
import nokia from '../assets/nokia.jpg'
import iphone from '../assets/iphone.jpg'
import huawei from '../assets/huawei.jpg'
import samsung from '../assets/samsung.jpg'
import motorola from '../assets/motorola.jpg'
import redmi from '../assets/redmi.jpg'
import oppo from '../assets/oppo.jpg'
import honor from '../assets/honor.jpg'
import realme from '../assets/realme.jpg'

const celulares = [
  { imagen: vivo, titulo: 'Vivo', descripcion: 'Explora el mundo de la tecnología con Vivo.' },
  { imagen: nokia, titulo: 'Nokia', descripcion: 'Experimenta la durabilidad y confiabilidad de Nokia.' },
  { imagen: iphone, titulo: 'iPhone', descripcion: 'Sumérgete en la experiencia premium de iPhone.' },
  { imagen: huawei, titulo: 'Huawei', descripcion: 'Explora la tecnología avanzada de Huawei.' },
  { imagen: samsung, titulo: 'Samsung', descripcion: 'Descubre la innovación y versatilidad de Samsung.' },
  { imagen: motorola, titulo: 'Motorola', descripcion: 'Explora la funcionalidad y rendimiento de Motorola.' },
  { imagen: redmi, titulo: 'Redmi', descripcion: 'Descubre la calidad y asequibilidad de Redmi.' },
  { imagen: oppo, titulo: 'Oppo', descripcion: 'Explora la innovación y estilo de Oppo.' },
  { imagen: honor, titulo: 'Honor', descripcion: 'Descubre la tecnología y diseño de Honor.' },
  { imagen: realme, titulo: 'Realme', descripcion: 'Explora la potencia y rendimiento de Realme.' },
]

function Carrusel({ modoOscuro }) {
  const [indiceActual, setIndiceActual] = useState(0)

  const celularActual = celulares[indiceActual]

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceActual((indice) => (indice + 1) % celulares.length)
    }, 4000)

    return () => clearInterval(intervalo)
  }, [])

  const anterior = () => {
    setIndiceActual((indice) => (indice - 1 + celulares.length) % celulares.length)
  }

  const siguiente = () => {
    setIndiceActual((indice) => (indice + 1) % celulares.length)
  }

  return (
    <section className={`relative min-h-[420px] overflow-hidden rounded-[20px] border shadow-lg sm:min-h-[470px] ${modoOscuro ? 'border-slate-700 bg-[#121d2e]' : 'border-gray-200 bg-white'}`}>

      {/* Imagen principal */}
      <img
        key={indiceActual}
        src={celularActual.imagen}
        alt={celularActual.titulo}
        className="block h-[420px] w-full object-cover animate-[cambioImagen_0.6s_ease-in-out] sm:h-[470px]"
      />

      {/* Capa para mejorar la lectura */}
      <div className={`absolute inset-0 ${modoOscuro ? 'bg-gradient-to-r from-[#09111f]/95 via-[#09111f]/70 to-transparent' : 'bg-gradient-to-r from-white/95 via-white/70 to-transparent'}`} />

      {/* Información del celular */}
      <div key={`contenido-${indiceActual}`} className="absolute left-[8%] right-[15%] top-1/2 z-10 max-w-[460px] -translate-y-1/2 animate-[entrarContenido_0.7s_ease-out] sm:left-[7%] sm:right-auto">

        <p className="mb-2 text-[0.7rem] font-extrabold tracking-[1.5px] text-blue-600 sm:text-[0.8rem] sm:tracking-[1.8px]">
          CELULAR DESTACADO
        </p>

        <h2 className={`my-2 text-[clamp(1.8rem,8vw,3.3rem)] font-bold leading-tight sm:my-3 ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
          {celularActual.titulo}
        </h2>

        <p className={`text-sm leading-relaxed sm:text-base ${modoOscuro ? 'text-slate-200' : 'text-gray-700'}`}>
          {celularActual.descripcion}
        </p>

        {/* Botón */}
        <button
          type="button"
          className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-xl sm:mt-5 sm:px-5 sm:py-3 sm:text-base"
        >
          Ver celular
        </button>
      </div>

      {/* Botón anterior */}
      <button
        type="button"
        onClick={anterior}
        aria-label="Celular anterior"
        className={`absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border text-lg transition-all duration-300 hover:scale-110 sm:left-5 sm:h-11 sm:w-11 sm:text-xl ${modoOscuro ? 'border-slate-600 bg-[#121d2e]/90 text-blue-400 hover:border-blue-400 hover:bg-[#17263c]' : 'border-gray-200 bg-white/90 text-blue-600 hover:border-blue-500 hover:bg-white'}`}
      >
        {'<'}
      </button>

      {/* Botón siguiente */}
      <button
        type="button"
        onClick={siguiente}
        aria-label="Celular siguiente"
        className={`absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border text-lg transition-all duration-300 hover:scale-110 sm:right-5 sm:h-11 sm:w-11 sm:text-xl ${modoOscuro ? 'border-slate-600 bg-[#121d2e]/90 text-blue-400 hover:border-blue-400 hover:bg-[#17263c]' : 'border-gray-200 bg-white/90 text-blue-600 hover:border-blue-500 hover:bg-white'}`}
      >
        {'>'}
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 z-20 flex max-w-[80%] -translate-x-1/2 items-center gap-1.5 overflow-hidden sm:bottom-5 sm:gap-2">
        {celulares.map((celular, indice) => (
          <button
            key={celular.titulo}
            type="button"
            onClick={() => setIndiceActual(indice)}
            aria-label={`Mostrar ${celular.titulo}`}
            className={`h-2.5 rounded-full p-0 transition-all duration-300 ${indice === indiceActual ? 'w-7 bg-blue-600' : 'w-2.5 bg-gray-400 hover:w-4 hover:bg-gray-500'}`}
          />
        ))}
      </div>
    </section>
  )
}

export default Carrusel