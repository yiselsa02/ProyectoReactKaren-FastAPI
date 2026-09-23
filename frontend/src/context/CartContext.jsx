import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { API_URL } from '../config'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'cellworld_cart'

function obtenerUsuarioActual() {
  try {
    const usuarioGuardado = localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      return null
    }

    return JSON.parse(usuarioGuardado)
  } catch (error) {
    console.error('Error leyendo usuario:', error)
    return null
  }
}

function obtenerIdUsuario(usuario) {
  if (!usuario || typeof usuario !== 'object') {
    return null
  }

  const id =
    usuario.id_usuario ??
    usuario.usuario_id ??
    usuario.id ??
    usuario.user_id

  const numero = Number(id)

  if (!Number.isInteger(numero) || numero <= 0) {
    return null
  }

  return numero
}

function crearClaveCarrito(usuarioId) {
  return `${CART_STORAGE_KEY}_${usuarioId}`
}

/**
 * Normaliza un producto.
 *
 * IMPORTANTE:
 * SOLO permite productos que tengan un ID numérico
 * válido proveniente del backend.
 *
 * Los productos predeterminados/estáticos que no tengan
 * un id_producto válido NO pueden entrar al carrito.
 */
function normalizarProducto(producto) {
  if (!producto || typeof producto !== 'object') {
    return null
  }

  const id =
    producto.id_producto ??
    producto.producto_id ??
    producto.id

  const idNumero = Number(id)

  // NO permitir productos sin ID válido.
  if (
    !Number.isInteger(idNumero) ||
    idNumero <= 0
  ) {
    console.warn(
      'Producto rechazado del carrito porque no tiene un ID válido:',
      producto
    )

    return null
  }

  const nombre =
    producto.nombre_producto ??
    producto.nombre ??
    producto.name ??
    'Producto'

  const precio =
    producto.precio ??
    producto.precio_unitario ??
    producto.precio_venta ??
    producto.price ??
    0

  const imagen =
    producto.imagen ??
    producto.imagen_url ??
    producto.url_imagen ??
    producto.image ??
    ''

  const precioNumero = Number(precio)

  return {
    ...producto,

    id_producto: idNumero,
    nombre_producto: String(nombre),
    precio: Number.isFinite(precioNumero)
      ? precioNumero
      : 0,
    imagen,
  }
}

function normalizarCarrito(carrito) {
  if (!Array.isArray(carrito)) {
    return []
  }

  return carrito
    .map((item) => {
      const producto = normalizarProducto(item)

      if (!producto) {
        return null
      }

      const cantidad = Number(item.cantidad)

      return {
        ...producto,
        cantidad:
          Number.isInteger(cantidad) && cantidad >= 1
            ? cantidad
            : 1,
      }
    })
    .filter(Boolean)
}

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([])
  const [usuarioId, setUsuarioId] = useState(null)
  const [comprando, setComprando] = useState(false)

  // ============================================================
  // CARGAR CARRITO DEL USUARIO
  // ============================================================

  const cargarCarritoUsuario = useCallback(() => {
    const usuario = obtenerUsuarioActual()
    const id = obtenerIdUsuario(usuario)

    setUsuarioId(id)

    if (!id) {
      setCarrito([])
      return
    }

    const clave = crearClaveCarrito(id)

    try {
      const carritoGuardado =
        localStorage.getItem(clave)

      if (!carritoGuardado) {
        setCarrito([])
        return
      }

      const carritoParseado =
        JSON.parse(carritoGuardado)

      setCarrito(
        normalizarCarrito(carritoParseado)
      )
    } catch (error) {
      console.error(
        'Error cargando carrito:',
        error
      )

      setCarrito([])
    }
  }, [])

  useEffect(() => {
    cargarCarritoUsuario()
  }, [cargarCarritoUsuario])

  // ============================================================
  // ESCUCHAR CAMBIOS DE USUARIO
  // ============================================================

  useEffect(() => {
    const manejarCambioUsuario = () => {
      cargarCarritoUsuario()
    }

    window.addEventListener(
      'usuarioCambio',
      manejarCambioUsuario
    )

    return () => {
      window.removeEventListener(
        'usuarioCambio',
        manejarCambioUsuario
      )
    }
  }, [cargarCarritoUsuario])

  // ============================================================
  // GUARDAR CARRITO
  // ============================================================

  useEffect(() => {
    if (!usuarioId) {
      return
    }

    const clave =
      crearClaveCarrito(usuarioId)

    try {
      localStorage.setItem(
        clave,
        JSON.stringify(carrito)
      )
    } catch (error) {
      console.error(
        'Error guardando carrito:',
        error
      )
    }
  }, [carrito, usuarioId])

  // ============================================================
  // AGREGAR AL CARRITO
  // ============================================================

  const agregarAlCarrito = useCallback(
    (producto) => {
      const usuario =
        obtenerUsuarioActual()

      const idUsuario =
        obtenerIdUsuario(usuario)

      if (!idUsuario) {
        console.warn(
          'No se puede agregar al carrito sin iniciar sesión.'
        )

        return {
          ok: false,
          message:
            'Debes iniciar sesión para agregar productos al carrito.',
        }
      }

      const productoNormalizado =
        normalizarProducto(producto)

      // Producto estático o sin ID.
      if (!productoNormalizado) {
        return {
          ok: false,
          message:
            'Este producto no está disponible para compra.',
        }
      }

      setUsuarioId(idUsuario)

      setCarrito((carritoActual) => {
        const existente =
          carritoActual.find(
            (item) =>
              Number(item.id_producto) ===
              Number(
                productoNormalizado.id_producto
              )
          )

        if (existente) {
          return carritoActual.map((item) =>
            Number(item.id_producto) ===
            Number(
              productoNormalizado.id_producto
            )
              ? {
                  ...item,
                  cantidad:
                    Number(item.cantidad) + 1,
                }
              : item
          )
        }

        return [
          ...carritoActual,
          {
            ...productoNormalizado,
            cantidad: 1,
          },
        ]
      })

      return {
        ok: true,
        message: 'Producto agregado al carrito.',
      }
    },
    []
  )

  // ============================================================
  // AGREGAR CANTIDAD ESPECÍFICA
  // ============================================================

  const agregarProducto = useCallback(
    (producto, cantidad = 1) => {
      const usuario =
        obtenerUsuarioActual()

      const idUsuario =
        obtenerIdUsuario(usuario)

      if (!idUsuario) {
        return {
          ok: false,
          message:
            'Debes iniciar sesión para agregar productos al carrito.',
        }
      }

      const productoNormalizado =
        normalizarProducto(producto)

      if (!productoNormalizado) {
        return {
          ok: false,
          message:
            'Este producto no está disponible para compra.',
        }
      }

      const cantidadNumero = Number(cantidad)

      if (
        !Number.isInteger(cantidadNumero) ||
        cantidadNumero <= 0
      ) {
        return {
          ok: false,
          message: 'Cantidad inválida.',
        }
      }

      setUsuarioId(idUsuario)

      setCarrito((carritoActual) => {
        const existente =
          carritoActual.find(
            (item) =>
              Number(item.id_producto) ===
              Number(
                productoNormalizado.id_producto
              )
          )

        if (existente) {
          return carritoActual.map((item) =>
            Number(item.id_producto) ===
            Number(
              productoNormalizado.id_producto
            )
              ? {
                  ...item,
                  cantidad:
                    Number(item.cantidad) +
                    cantidadNumero,
                }
              : item
          )
        }

        return [
          ...carritoActual,
          {
            ...productoNormalizado,
            cantidad: cantidadNumero,
          },
        ]
      })

      return {
        ok: true,
        message: 'Producto agregado al carrito.',
      }
    },
    []
  )

  // ============================================================
  // AUMENTAR
  // ============================================================

  const aumentarCantidad = useCallback(
    (idProducto) => {
      setCarrito((carritoActual) =>
        carritoActual.map((item) =>
          Number(item.id_producto) ===
          Number(idProducto)
            ? {
                ...item,
                cantidad:
                  Number(item.cantidad) + 1,
              }
            : item
        )
      )
    },
    []
  )

  // ============================================================
  // DISMINUIR
  // ============================================================

  const disminuirCantidad = useCallback(
    (idProducto) => {
      setCarrito((carritoActual) =>
        carritoActual
          .map((item) =>
            Number(item.id_producto) ===
            Number(idProducto)
              ? {
                  ...item,
                  cantidad:
                    Number(item.cantidad) - 1,
                }
              : item
          )
          .filter(
            (item) =>
              Number(item.cantidad) > 0
          )
      )
    },
    []
  )

  // ============================================================
  // ELIMINAR PRODUCTO
  // ============================================================

  const eliminarDelCarrito = useCallback(
    (idProducto) => {
      setCarrito((carritoActual) =>
        carritoActual.filter(
          (item) =>
            Number(item.id_producto) !==
            Number(idProducto)
        )
      )
    },
    []
  )

  const removeItem =
    eliminarDelCarrito

  // ============================================================
  // ACTUALIZAR CANTIDAD
  // ============================================================

  const actualizarCantidad = useCallback(
    (idProducto, cantidad) => {
      const cantidadNumero =
        Number(cantidad)

      if (
        !Number.isInteger(cantidadNumero) ||
        cantidadNumero <= 0
      ) {
        setCarrito((carritoActual) =>
          carritoActual.filter(
            (item) =>
              Number(item.id_producto) !==
              Number(idProducto)
          )
        )

        return
      }

      setCarrito((carritoActual) =>
        carritoActual.map((item) =>
          Number(item.id_producto) ===
          Number(idProducto)
            ? {
                ...item,
                cantidad: cantidadNumero,
              }
            : item
        )
      )
    },
    []
  )

  const updateQuantity =
    actualizarCantidad

  // ============================================================
  // VACIAR CARRITO
  // ============================================================

  const vaciarCarrito = useCallback(() => {
    setCarrito([])
  }, [])

  const clearCart = vaciarCarrito

  // ============================================================
  // LIMPIAR CARRITO AL CERRAR SESIÓN
  // ============================================================

  const clearCartOnLogout =
    useCallback(() => {
      if (usuarioId) {
        const clave =
          crearClaveCarrito(usuarioId)

        localStorage.removeItem(clave)
      }

      setCarrito([])
      setUsuarioId(null)
    }, [usuarioId])

  // ============================================================
  // CANTIDAD TOTAL
  // ============================================================

  const count = useMemo(() => {
    return carrito.reduce(
      (total, item) =>
        total + Number(item.cantidad || 0),
      0
    )
  }, [carrito])

  // ============================================================
  // TOTAL
  // ============================================================

  const total = useMemo(() => {
    return carrito.reduce(
      (suma, item) =>
        suma +
        Number(item.precio || 0) *
          Number(item.cantidad || 0),
      0
    )
  }, [carrito])

  const obtenerSubtotal = useCallback(
    (item) => {
      return (
        Number(item.precio || 0) *
        Number(item.cantidad || 0)
      )
    },
    []
  )

  // ============================================================
  // COMPRAR
  // ============================================================

  const checkout = useCallback(
    async () => {
      if (comprando) {
        return null
      }

      const usuario =
        obtenerUsuarioActual()

      const idUsuario =
        obtenerIdUsuario(usuario)

      if (!idUsuario) {
        throw new Error(
          'Debes iniciar sesión para realizar la compra.'
        )
      }

      if (
        !Array.isArray(carrito) ||
        carrito.length === 0
      ) {
        throw new Error(
          'El carrito está vacío.'
        )
      }

      const token =
        localStorage.getItem('token')

      if (!token) {
        throw new Error(
          'Tu sesión ha expirado. Inicia sesión nuevamente.'
        )
      }

      // ========================================================
      // VALIDAR PRODUCTOS ANTES DE COMPRAR
      // ========================================================

      const productosValidos =
        carrito.every((item) => {
          const id = Number(
            item.id_producto
          )

          const cantidad = Number(
            item.cantidad
          )

          const precio = Number(
            item.precio
          )

          return (
            Number.isInteger(id) &&
            id > 0 &&
            Number.isInteger(cantidad) &&
            cantidad > 0 &&
            Number.isFinite(precio) &&
            precio >= 0
          )
        })

      if (!productosValidos) {
        throw new Error(
          'El carrito contiene un producto inválido.'
        )
      }

      // ========================================================
      // EL BACKEND ESPERA "items"
      // ========================================================

      const items = carrito.map(
        (item) => ({
          producto_id:
            Number(item.id_producto),

          nombre_producto:
            String(
              item.nombre_producto ||
                'Producto'
            ).trim(),

          precio_unitario:
            Number(item.precio) || 0,

          cantidad:
            Number(item.cantidad),
        })
      )

      // ========================================================
      // API URL DESDE CONFIG
      // ========================================================

      if (!API_URL) {
        throw new Error(
          'API_URL no está configurado correctamente.'
        )
      }

      const url =
        `${API_URL.replace(/\/$/, '')}/api/pedidos`

      console.log(
        '===================================='
      )

      console.log(
        'REALIZANDO COMPRA'
      )

      console.log(
        'URL:',
        url
      )

      console.log(
        'USUARIO:',
        idUsuario
      )

      console.log(
        'ITEMS:',
        items
      )

      console.log(
        '===================================='
      )

      setComprando(true)

      try {
        const respuesta =
          await fetch(url, {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              items,
            }),
          })

        let datos = null

        try {
          datos =
            await respuesta.json()
        } catch {
          datos = null
        }

        console.log(
          'RESPUESTA COMPRA:',
          respuesta.status,
          datos
        )

        if (!respuesta.ok) {
          const mensaje =
            datos?.detail ||
            datos?.message ||
            `Error HTTP ${respuesta.status}`

          throw new Error(
            mensaje
          )
        }

        // ======================================================
        // SOLO LIMPIAR SI LA COMPRA REALMENTE FUE EXITOSA
        // ======================================================

        setCarrito([])

        return datos
      } finally {
        setComprando(false)
      }
    },
    [carrito, comprando]
  )

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = useMemo(
    () => ({
      carrito,

      // Alias por compatibilidad
      cart: carrito,

      usuarioId,

      count,

      total,

      comprando,

      agregarAlCarrito,

      agregarProducto,

      aumentarCantidad,

      disminuirCantidad,

      actualizarCantidad,

      updateQuantity,

      eliminarDelCarrito,

      removeItem,

      vaciarCarrito,

      clearCart,

      clearCartOnLogout,

      obtenerSubtotal,

      checkout,
    }),
    [
      carrito,
      usuarioId,
      count,
      total,
      comprando,
      agregarAlCarrito,
      agregarProducto,
      aumentarCantidad,
      disminuirCantidad,
      actualizarCantidad,
      eliminarDelCarrito,
      vaciarCarrito,
      clearCartOnLogout,
      obtenerSubtotal,
      checkout,
    ]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context =
    useContext(CartContext)

  if (!context) {
    throw new Error(
      'useCart debe utilizarse dentro de CartProvider'
    )
  }

  return context
}

export default CartContext