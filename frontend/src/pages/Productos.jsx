import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { API_URL } from '../config'

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
  {
    id: 'vivo',
    titulo: 'Vivo V30',
    nombre: 'Vivo V30',
    categoria: 'Celular',
    descripcion: 'Smartphone Vivo con excelente rendimiento y cámara.',
    almacenamiento: '256 GB',
    ram: '12 GB',
    color: 'Negro',
    precio: '$1.899.900',
    imagen: vivo,
  },
  {
    id: 'nokia',
    titulo: 'Nokia G42',
    nombre: 'Nokia G42',
    categoria: 'Celular',
    descripcion: 'Celular Nokia resistente, rápido y confiable.',
    almacenamiento: '128 GB',
    ram: '6 GB',
    color: 'Gris',
    precio: '$899.900',
    imagen: nokia,
  },
  {
    id: 'iphone',
    titulo: 'iPhone 15',
    nombre: 'iPhone 15',
    categoria: 'Celular',
    descripcion: 'iPhone de última generación con gran rendimiento.',
    almacenamiento: '128 GB',
    ram: '6 GB',
    color: 'Azul',
    precio: '$3.999.900',
    imagen: iphone,
  },
  {
    id: 'huawei',
    titulo: 'Huawei Nova 12',
    nombre: 'Huawei Nova 12',
    categoria: 'Celular',
    descripcion: 'Smartphone Huawei con diseño moderno y potente cámara.',
    almacenamiento: '256 GB',
    ram: '8 GB',
    color: 'Azul',
    precio: '$1.699.900',
    imagen: huawei,
  },
  {
    id: 'samsung',
    titulo: 'Samsung Galaxy S24',
    nombre: 'Samsung Galaxy S24',
    categoria: 'Celular',
    descripcion: 'Galaxy S24 con gran potencia, pantalla y cámara.',
    almacenamiento: '256 GB',
    ram: '8 GB',
    color: 'Negro',
    precio: '$3.499.900',
    imagen: samsung,
  },
  {
    id: 'motorola',
    titulo: 'Motorola Edge 50',
    nombre: 'Motorola Edge 50',
    categoria: 'Celular',
    descripcion: 'Motorola con gran pantalla y excelente rendimiento.',
    almacenamiento: '256 GB',
    ram: '8 GB',
    color: 'Verde',
    precio: '$1.799.900',
    imagen: motorola,
  },
  {
    id: 'redmi',
    titulo: 'Redmi Note 13',
    nombre: 'Redmi Note 13',
    categoria: 'Celular',
    descripcion: 'Celular Redmi con excelente relación calidad-precio.',
    almacenamiento: '256 GB',
    ram: '8 GB',
    color: 'Negro',
    precio: '$999.900',
    imagen: redmi,
  },
  {
    id: 'oppo',
    titulo: 'OPPO Reno 11',
    nombre: 'OPPO Reno 11',
    categoria: 'Celular',
    descripcion: 'OPPO con diseño elegante y cámara avanzada.',
    almacenamiento: '256 GB',
    ram: '12 GB',
    color: 'Verde',
    precio: '$1.899.900',
    imagen: oppo,
  },
  {
    id: 'honor',
    titulo: 'Honor 200',
    nombre: 'Honor 200',
    categoria: 'Celular',
    descripcion: 'Smartphone Honor con alto rendimiento y gran autonomía.',
    almacenamiento: '256 GB',
    ram: '12 GB',
    color: 'Negro',
    precio: '$1.999.900',
    imagen: honor,
  },
  {
    id: 'realme',
    titulo: 'Realme 12 Pro',
    nombre: 'Realme 12 Pro',
    categoria: 'Celular',
    descripcion: 'Realme potente con pantalla fluida y cámara profesional.',
    almacenamiento: '256 GB',
    ram: '12 GB',
    color: 'Azul',
    precio: '$1.699.900',
    imagen: realme,
  },
]

function obtenerClaveFavoritos(usuario) {
  const idUsuario =
    usuario?.id_usuario ??
    usuario?.usuario_id ??
    usuario?.id ??
    usuario?.email ??
    usuario?.correo

  if (!idUsuario) {
    return 'cellworld_favorites_guest'
  }

  return `cellworld_favorites_${idUsuario}`
}

function Productos({ modoOscuro }) {
  const [productosBD, setProductosBD] = useState([])
  const [cargando, setCargando] = useState(true)
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('Todas')

  const [usuario, setUsuario] = useState(null)
  const [favoritos, setFavoritos] = useState([])
  const [favoritosCargados, setFavoritosCargados] = useState(false)

  const [agregadoRecientemente, setAgregadoRecientemente] = useState(null)

  const { addItem } = useCart()

  const favoritosKey = obtenerClaveFavoritos(usuario)

  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const usuarioGuardado = localStorage.getItem('usuario')

        if (!usuarioGuardado) {
          setUsuario(null)
          return
        }

        const datos = JSON.parse(usuarioGuardado)
        setUsuario(datos)
      } catch (error) {
        console.error('Error cargando usuario:', error)
        setUsuario(null)
      }
    }

    cargarUsuario()

    window.addEventListener('usuarioCambio', cargarUsuario)
    window.addEventListener('storage', cargarUsuario)
    window.addEventListener('focus', cargarUsuario)

    return () => {
      window.removeEventListener('usuarioCambio', cargarUsuario)
      window.removeEventListener('storage', cargarUsuario)
      window.removeEventListener('focus', cargarUsuario)
    }
  }, [])

  useEffect(() => {
    setFavoritosCargados(false)

    try {
      const guardados = localStorage.getItem(favoritosKey)

      if (!guardados) {
        setFavoritos([])
        return
      }

      const datos = JSON.parse(guardados)

      setFavoritos(
        Array.isArray(datos)
          ? datos
          : []
      )
    } catch (error) {
      console.error('Error cargando favoritos:', error)
      setFavoritos([])
    } finally {
      setFavoritosCargados(true)
    }
  }, [favoritosKey])

  useEffect(() => {
    if (!favoritosCargados) {
      return
    }

    try {
      localStorage.setItem(
        favoritosKey,
        JSON.stringify(favoritos)
      )
    } catch (error) {
      console.error('Error guardando favoritos:', error)
    }
  }, [
    favoritos,
    favoritosCargados,
    favoritosKey,
  ])

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      const respuesta = await fetch(
        `${API_URL}/api/productos`
      )

      if (!respuesta.ok) {
        throw new Error('Error al obtener los productos')
      }

      const datos = await respuesta.json()

      const listaProductos = Array.isArray(datos)
        ? datos
        : datos.productos || []

      const productosActivos = listaProductos.filter(
        (producto) =>
          producto.estado === true ||
          producto.estado === 1
      )

      setProductosBD(productosActivos)
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setCargando(false)
    }
  }

  const todosLosProductos = [
    ...celulares,
    ...productosBD,
  ]

  const obtenerMarcaProducto = (producto) => {
    if (producto?.marca) return String(producto.marca)

    const nombre = String(
      producto?.titulo ||
      producto?.nombre ||
      ''
    ).toLowerCase()

    const marcas = [
      'vivo',
      'nokia',
      'iphone',
      'huawei',
      'samsung',
      'motorola',
      'redmi',
      'oppo',
      'honor',
      'realme',
      'xiaomi',
      'tecno',
      'oneplus',
      'google',
    ]

    return (
      marcas.find((marca) => nombre.includes(marca)) ||
      'Otras'
    )
  }

  const marcasDisponibles = [
    'Todas',
    ...Array.from(
      new Set(todosLosProductos.map(obtenerMarcaProducto))
    ).sort(),
  ]

  const productosFiltrados = todosLosProductos.filter(
    (producto) =>
      marcaSeleccionada === 'Todas' ||
      obtenerMarcaProducto(producto) === marcaSeleccionada
  )

  const obtenerIdProducto = (
    producto,
    indice = 0
  ) => {
    const esBD =
      producto?.id_producto !== undefined &&
      producto?.id_producto !== null

    if (esBD) {
      return `bd-${producto.id_producto}`
    }

    if (
      producto?.id !== undefined &&
      producto?.id !== null
    ) {
      return String(producto.id)
    }

    const nombre =
      producto?.titulo ||
      producto?.nombre ||
      `producto-${indice}`

    return `catalogo-${String(nombre)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')}`
  }

  const obtenerNombreProducto = (producto) => {
    return (
      producto?.titulo ||
      producto?.nombre ||
      'Producto'
    )
  }

  const obtenerPrecioProducto = (producto) => {
    if (
      producto?.precio === undefined ||
      producto?.precio === null
    ) {
      return 0
    }

    if (typeof producto.precio === 'number') {
      return producto.precio
    }

    return Number(
      String(producto.precio).replace(
        /[^0-9]/g,
        ''
      )
    )
  }

  const obtenerImagenProducto = (producto) => {
    return (
      producto?.imagen ||
      producto?.image ||
      null
    )
  }

  const normalizarProducto = (
    producto,
    indice = 0
  ) => {
    const id = obtenerIdProducto(
      producto,
      indice
    )

    const nombre = obtenerNombreProducto(producto)
    const precio = obtenerPrecioProducto(producto)
    const imagen = obtenerImagenProducto(producto)

    return {
      ...producto,
      id,
      nombre,
      titulo: producto?.titulo || nombre,
      name: nombre,
      precio,
      price: precio,
      imagen,
      image: imagen,
      categoria:
        producto?.categoria ||
        producto?.category ||
        'Celular',
    }
  }

  const estaSeleccionado = (
    producto,
    indice
  ) => {
    const id = obtenerIdProducto(
      producto,
      indice
    )

    return favoritos.some(
      (favorito) =>
        String(
          favorito?.id ??
          favorito?.id_producto ??
          favorito?.producto_id ??
          favorito
        ) === String(id)
    )
  }

  const guardarFavoritos = (nuevosFavoritos) => {
    setFavoritos(nuevosFavoritos)

    try {
      localStorage.setItem(
        favoritosKey,
        JSON.stringify(nuevosFavoritos)
      )
    } catch (error) {
      console.error(
        'Error guardando favoritos:',
        error
      )
    }

    window.dispatchEvent(
      new CustomEvent(
        'cellworld-favorites-updated',
        {
          detail: {
            key: favoritosKey,
          },
        }
      )
    )
  }

  const alternarFavorito = (
    producto,
    indice
  ) => {
    const productoNormalizado =
      normalizarProducto(
        producto,
        indice
      )

    const id = productoNormalizado.id

    const yaExiste = favoritos.some(
      (favorito) =>
        String(
          favorito?.id ??
          favorito?.id_producto ??
          favorito?.producto_id ??
          favorito
        ) === String(id)
    )

    let nuevosFavoritos

    if (yaExiste) {
      nuevosFavoritos = favoritos.filter(
        (favorito) =>
          String(
            favorito?.id ??
            favorito?.id_producto ??
            favorito?.producto_id ??
            favorito
          ) !== String(id)
      )
    } else {
      nuevosFavoritos = [
        ...favoritos,
        productoNormalizado,
      ]
    }

    guardarFavoritos(nuevosFavoritos)
  }

  useEffect(() => {
    const actualizarFavoritos = (evento) => {
      if (
        evento?.detail?.key &&
        evento.detail.key !== favoritosKey
      ) {
        return
      }

      try {
        const guardados =
          localStorage.getItem(
            favoritosKey
          )

        if (!guardados) {
          setFavoritos([])
          return
        }

        const datos = JSON.parse(guardados)

        setFavoritos(
          Array.isArray(datos)
            ? datos
            : []
        )
      } catch (error) {
        console.error(
          'Error actualizando favoritos:',
          error
        )

        setFavoritos([])
      }
    }

    window.addEventListener(
      'storage',
      actualizarFavoritos
    )

    window.addEventListener(
      'cellworld-favorites-updated',
      actualizarFavoritos
    )

    window.addEventListener(
      'focus',
      actualizarFavoritos
    )

    return () => {
      window.removeEventListener(
        'storage',
        actualizarFavoritos
      )

      window.removeEventListener(
        'cellworld-favorites-updated',
        actualizarFavoritos
      )

      window.removeEventListener(
        'focus',
        actualizarFavoritos
      )
    }
  }, [favoritosKey])

  const agregarAlCarrito = (
    producto,
    indice
  ) => {
    const productoNormalizado =
      normalizarProducto(
        producto,
        indice
      )

    addItem({
      id: productoNormalizado.id,
      name: productoNormalizado.name,
      price: productoNormalizado.price,
      image: productoNormalizado.image,
      categoria: productoNormalizado.categoria,
      descripcion: productoNormalizado.descripcion,
      almacenamiento: productoNormalizado.almacenamiento,
      ram: productoNormalizado.ram,
      color: productoNormalizado.color,
    })

    const id = productoNormalizado.id

    setAgregadoRecientemente(id)

    setTimeout(() => {
      setAgregadoRecientemente(null)
    }, 1200)
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }
    ).format(precio)
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
        modoOscuro
          ? 'bg-[#0b1422] text-white'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          modoOscuro
            ? 'bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_35%)]'
            : 'bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_35%)]'
        }`}
      />

      <div
        className={`pointer-events-none absolute inset-0 opacity-[0.18] ${
          modoOscuro
            ? 'bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)]'
            : 'bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)]'
        } bg-[size:40px_40px]`}
      />

      <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="mb-10 text-center">
          <p
            className={`mb-3 text-sm font-bold uppercase tracking-[0.25em] ${
              modoOscuro
                ? 'text-blue-400'
                : 'text-blue-600'
            }`}
          >
            Catálogo celulares
          </p>

          <h1
            className={`text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${
              modoOscuro
                ? 'text-white'
                : 'text-slate-900'
            }`}
          >
            Celulares destacados
          </h1>

          <p
            className={`mx-auto mt-4 max-w-2xl text-base sm:text-lg ${
              modoOscuro
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Encuentra el celular ideal para ti
            entre nuestras mejores opciones.
          </p>
        </div>

        {cargando && (
          <div className="mb-8 flex justify-center">
            <div
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                modoOscuro
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-white text-slate-600 shadow'
              }`}
            >
              Cargando productos...
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="filtro-marca"
            className={`text-sm font-semibold ${
              modoOscuro ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            Filtrar por marca
          </label>

          <select
            id="filtro-marca"
            value={marcaSeleccionada}
            onChange={(event) => setMarcaSeleccionada(event.target.value)}
            className={`min-w-48 rounded-xl border px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 ${
              modoOscuro
                ? 'border-slate-700 bg-slate-800 text-white'
                : 'border-slate-200 bg-white text-slate-800 shadow-sm'
            }`}
          >
            {marcasDisponibles.map((marca) => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">

          {productosFiltrados.map(
            (celular, indice) => {
              const idProducto =
                obtenerIdProducto(
                  celular,
                  indice
                )

              const nombre =
                obtenerNombreProducto(
                  celular
                )

              const precio =
                obtenerPrecioProducto(
                  celular
                )

              const imagen =
                obtenerImagenProducto(
                  celular
                )

              const seleccionado =
                estaSeleccionado(
                  celular,
                  indice
                )

              return (
                <article
                  key={`${idProducto}-${indice}`}
                  className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${
                    modoOscuro
                      ? 'border-slate-700/80 bg-[#111c2d] shadow-xl shadow-black/20 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-950/30'
                      : 'border-slate-200 bg-white shadow-lg shadow-slate-200/60 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100'
                  }`}
                >

                  <div className="relative h-56 overflow-hidden">

                    {imagen ? (
                      <img
                        src={imagen}
                        alt={nombre}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center ${
                          modoOscuro
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        Sin imagen
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

                    <div className="absolute left-4 top-4 z-10">
                      <span className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                        {celular.categoria ||
                          celular.category ||
                          'Celular'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        alternarFavorito(
                          celular,
                          indice
                        )
                      }
                      aria-label={
                        seleccionado
                          ? 'Quitar de seleccionados'
                          : 'Agregar a seleccionados'
                      }
                      title={
                        seleccionado
                          ? 'Quitar de seleccionados'
                          : 'Agregar a seleccionados'
                      }
                      className={`absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 ${
                        seleccionado
                          ? 'border-red-200 bg-red-500 text-white hover:bg-red-600'
                          : modoOscuro
                            ? 'border-slate-600 bg-[#121d2e]/90 text-white hover:border-red-400 hover:text-red-400'
                            : 'border-gray-200 bg-white/95 text-gray-500 hover:border-red-200 hover:text-red-500'
                      }`}
                    >
                      <Heart
                        size={21}
                        fill={
                          seleccionado
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>
                  </div>

                  <div className="p-6">

                    <div className="mb-4">
                      <h2
                        className={`text-xl font-black ${
                          modoOscuro
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                      >
                        {nombre}
                      </h2>

                      <p
                        className={`mt-2 min-h-[48px] text-sm leading-6 ${
                          modoOscuro
                            ? 'text-slate-400'
                            : 'text-slate-600'
                        }`}
                      >
                        {celular.descripcion ||
                          'Excelente celular con grandes características y rendimiento.'}
                      </p>
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-2">

                      <div
                        className={`rounded-xl p-3 ${
                          modoOscuro
                            ? 'bg-slate-800/70'
                            : 'bg-slate-50'
                        }`}
                      >
                        <p
                          className={`text-[11px] font-bold uppercase tracking-wide ${
                            modoOscuro
                              ? 'text-slate-500'
                              : 'text-slate-400'
                          }`}
                        >
                          Almacenamiento
                        </p>

                        <p
                          className={`mt-1 text-sm font-bold ${
                            modoOscuro
                              ? 'text-slate-200'
                              : 'text-slate-700'
                          }`}
                        >
                          {celular.almacenamiento ||
                            'N/A'}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl p-3 ${
                          modoOscuro
                            ? 'bg-slate-800/70'
                            : 'bg-slate-50'
                        }`}
                      >
                        <p
                          className={`text-[11px] font-bold uppercase tracking-wide ${
                            modoOscuro
                              ? 'text-slate-500'
                              : 'text-slate-400'
                          }`}
                        >
                          RAM
                        </p>

                        <p
                          className={`mt-1 text-sm font-bold ${
                            modoOscuro
                              ? 'text-slate-200'
                              : 'text-slate-700'
                          }`}
                        >
                          {celular.ram ||
                            'N/A'}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl p-3 ${
                          modoOscuro
                            ? 'bg-slate-800/70'
                            : 'bg-slate-50'
                        }`}
                      >
                        <p
                          className={`text-[11px] font-bold uppercase tracking-wide ${
                            modoOscuro
                              ? 'text-slate-500'
                              : 'text-slate-400'
                          }`}
                        >
                          Color
                        </p>

                        <p
                          className={`mt-1 text-sm font-bold ${
                            modoOscuro
                              ? 'text-slate-200'
                              : 'text-slate-700'
                          }`}
                        >
                          {celular.color ||
                            'N/A'}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl p-3 ${
                          modoOscuro
                            ? 'bg-slate-800/70'
                            : 'bg-slate-50'
                        }`}
                      >
                        <p
                          className={`text-[11px] font-bold uppercase tracking-wide ${
                            modoOscuro
                              ? 'text-slate-500'
                              : 'text-slate-400'
                          }`}
                        >
                          Estado
                        </p>

                        <p className="mt-1 text-sm font-bold text-green-500">
                          Disponible
                        </p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          modoOscuro
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        Precio
                      </p>

                      <p
                        className={`mt-1 text-2xl font-black ${
                          modoOscuro
                            ? 'text-blue-400'
                            : 'text-blue-600'
                        }`}
                      >
                        {formatearPrecio(
                          precio
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        agregarAlCarrito(
                          celular,
                          indice
                        )
                      }
                      className={`group/carrito relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 ${
                        agregadoRecientemente ===
                        idProducto
                          ? 'bg-green-500 shadow-lg shadow-green-500/40'
                          : modoOscuro
                            ? 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/40'
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-300/60'
                      }`}
                    >

                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/carrito:translate-x-full"
                      />

                      {agregadoRecientemente ===
                      idProducto ? (
                        <span className="relative flex items-center gap-2 animate-[bounce_0.5s_ease-in-out]">

                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                            ✓
                          </span>

                          ¡Agregado!
                        </span>
                      ) : (
                        <span className="relative flex items-center gap-2">

                          <span>
                            Agregar al carrito
                          </span>

                          <span
                            aria-hidden="true"
                            className="transition-all duration-300 group-hover/carrito:translate-x-2 group-hover/carrito:scale-125"
                          >
                            →
                          </span>

                        </span>
                      )}

                    </button>
                  </div>
                </article>
              )
            }
          )}
        </div>

        {productosFiltrados.length === 0 && (
          <div className={`mt-8 rounded-2xl border p-8 text-center text-sm ${
            modoOscuro
              ? 'border-slate-700 bg-slate-900 text-slate-300'
              : 'border-slate-200 bg-white text-slate-500'
          }`}>
            No hay productos disponibles para esta marca.
          </div>
        )}

        {!cargando &&
          todosLosProductos.length === 0 && (
            <div
              className={`mx-auto mt-10 max-w-xl rounded-2xl border p-8 text-center ${
                modoOscuro
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-200 bg-white shadow'
              }`}
            >
              <h2 className="text-xl font-bold">
                No hay productos disponibles
              </h2>

              <p
                className={`mt-2 ${
                  modoOscuro
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Actualmente no hay celulares
                disponibles para mostrar.
              </p>
            </div>
          )}
      </section>
    </main>
  )
}

export default Productos