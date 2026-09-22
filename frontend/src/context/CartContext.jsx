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

// ============================================================
// OBTENER USUARIO ACTUAL
// ============================================================

const obtenerUsuarioId = () => {
  try {
    const usuarioGuardado = localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      return null
    }

    const usuario = JSON.parse(usuarioGuardado)

    const id = Number(usuario?.id_usuario)

    if (!Number.isInteger(id) || id <= 0) {
      return null
    }

    return String(id)
  } catch {
    return null
  }
}

// ============================================================
// CLAVE DEL CARRITO
// ============================================================

const obtenerClaveCarrito = (usuarioId) => {
  if (!usuarioId) {
    return 'cellworld_cart_guest'
  }

  return `cellworld_cart_${usuarioId}`
}

// ============================================================
// NORMALIZAR ID DEL PRODUCTO
// ============================================================

const obtenerProductoId = (producto) => {
  if (!producto) {
    return null
  }

  let id =
    producto.id ??
    producto.id_producto ??
    producto.producto_id

  if (typeof id === 'string') {
    id = id.trim().replace(/^bd-/, '')
  }

  const numero = Number(id)

  if (!Number.isInteger(numero) || numero <= 0) {
    return null
  }

  return numero
}

// ============================================================
// NORMALIZAR NOMBRE
// ============================================================

const obtenerNombreProducto = (producto) => {
  const nombre =
    producto?.name ??
    producto?.nombre ??
    producto?.nombre_producto ??
    ''

  return String(nombre).trim()
}

// ============================================================
// NORMALIZAR PRECIO
// ============================================================

const obtenerPrecioProducto = (producto) => {
  const precio =
    producto?.price ??
    producto?.precio ??
    producto?.precio_unitario ??
    0

  const numero = Number(precio)

  return Number.isFinite(numero) && numero >= 0
    ? numero
    : 0
}

// ============================================================
// NORMALIZAR CANTIDAD
// ============================================================

const obtenerCantidad = (producto) => {
  const cantidad =
    producto?.quantity ??
    producto?.cantidad ??
    1

  const numero = Number(cantidad)

  return Number.isInteger(numero) && numero > 0
    ? numero
    : 1
}

// ============================================================
// NORMALIZAR PRODUCTO PARA EL CARRITO
// ============================================================

const normalizarProducto = (producto, cantidad = 1) => {
  const id = obtenerProductoId(producto)
  const nombre = obtenerNombreProducto(producto)
  const precio = obtenerPrecioProducto(producto)

  if (!id || !nombre) {
    return null
  }

  return {
    ...producto,

    id,
    name: nombre,
    price: precio,

    quantity:
      Number.isInteger(Number(cantidad)) &&
      Number(cantidad) > 0
        ? Number(cantidad)
        : 1,
  }
}

// ============================================================
// OBTENER CARRITO GUARDADO
// ============================================================

const obtenerCarritoGuardado = (usuarioId) => {
  try {
    const clave = obtenerClaveCarrito(usuarioId)

    const carritoGuardado =
      localStorage.getItem(clave)

    if (!carritoGuardado) {
      return []
    }

    const datos = JSON.parse(carritoGuardado)

    if (!Array.isArray(datos)) {
      return []
    }

    // Convertimos cualquier carrito viejo
    // al formato único actual.
    return datos
      .map((item) =>
        normalizarProducto(
          item,
          obtenerCantidad(item)
        )
      )
      .filter(Boolean)
  } catch (error) {
    console.error(
      'Error leyendo el carrito:',
      error
    )

    return []
  }
}

// ============================================================
// PROVIDER
// ============================================================

export function CartProvider({ children }) {
  const [usuarioId, setUsuarioId] = useState(
    () => obtenerUsuarioId()
  )

  const [items, setItems] = useState(
    () =>
      obtenerCarritoGuardado(
        obtenerUsuarioId()
      )
  )

  // ==========================================================
  // GUARDAR CARRITO
  // ==========================================================

  useEffect(() => {
    const clave =
      obtenerClaveCarrito(usuarioId)

    if (items.length === 0) {
      localStorage.removeItem(clave)
      return
    }

    localStorage.setItem(
      clave,
      JSON.stringify(items)
    )
  }, [items, usuarioId])

  // ==========================================================
  // ESCUCHAR CAMBIOS DE USUARIO
  // ==========================================================

  useEffect(() => {
    const manejarCambioUsuario = (event) => {
      const nuevoUsuarioId =
        event?.detail?.userId !== undefined
          ? event.detail.userId
          : obtenerUsuarioId()

      const nuevoId =
        nuevoUsuarioId === null ||
        nuevoUsuarioId === undefined
          ? null
          : String(nuevoUsuarioId)

      setUsuarioId(nuevoId)

      setItems(
        obtenerCarritoGuardado(nuevoId)
      )
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
  }, [])

  // ==========================================================
  // AGREGAR PRODUCTO
  // ==========================================================

  const addItem = useCallback((producto) => {
    const productoNormalizado =
      normalizarProducto(producto, 1)

    if (!productoNormalizado) {
      console.error(
        'No se pudo agregar el producto al carrito:',
        producto
      )

      return false
    }

    const productoId =
      productoNormalizado.id

    setItems((actuales) => {
      const existe = actuales.some(
        (item) =>
          obtenerProductoId(item) ===
          productoId
      )

      if (existe) {
        return actuales.map((item) => {
          if (
            obtenerProductoId(item) !==
            productoId
          ) {
            return item
          }

          return {
            ...item,
            id: productoId,
            name:
              productoNormalizado.name,
            price:
              productoNormalizado.price,
            quantity:
              obtenerCantidad(item) + 1,
          }
        })
      }

      return [
        ...actuales,
        productoNormalizado,
      ]
    })

    return true
  }, [])

  // ==========================================================
  // ELIMINAR PRODUCTO
  // ==========================================================

  const removeItem = useCallback((producto) => {
    const productoId =
      obtenerProductoId(producto)

    if (!productoId) {
      return
    }

    setItems((actuales) =>
      actuales.filter(
        (item) =>
          obtenerProductoId(item) !==
          productoId
      )
    )
  }, [])

  // ==========================================================
  // ACTUALIZAR CANTIDAD
  // ==========================================================

  const updateQuantity = useCallback(
    (producto, cantidad) => {
      const productoId =
        obtenerProductoId(producto)

      if (!productoId) {
        return
      }

      const nuevaCantidad =
        Number(cantidad)

      if (
        !Number.isInteger(nuevaCantidad)
      ) {
        return
      }

      if (nuevaCantidad <= 0) {
        setItems((actuales) =>
          actuales.filter(
            (item) =>
              obtenerProductoId(item) !==
              productoId
          )
        )

        return
      }

      setItems((actuales) =>
        actuales.map((item) => {
          if (
            obtenerProductoId(item) !==
            productoId
          ) {
            return item
          }

          return {
            ...item,
            quantity: nuevaCantidad,
          }
        })
      )
    },
    []
  )

  // ==========================================================
  // LIMPIAR CARRITO
  // ==========================================================

  const clearCart = useCallback(() => {
    setItems([])

    const usuarioActual =
      obtenerUsuarioId()

    if (usuarioActual) {
      localStorage.removeItem(
        obtenerClaveCarrito(
          usuarioActual
        )
      )
    } else {
      localStorage.removeItem(
        'cellworld_cart_guest'
      )
    }
  }, [])

  // ==========================================================
  // LIMPIAR AL CERRAR SESIÓN
  // ==========================================================

  const clearCartOnLogout =
    useCallback(() => {
      const usuarioActual =
        obtenerUsuarioId()

      if (usuarioActual) {
        localStorage.removeItem(
          obtenerClaveCarrito(
            usuarioActual
          )
        )
      }

      localStorage.removeItem(
        'cellworld_cart_guest'
      )

      setItems([])
      setUsuarioId(null)
    }, [])

  // ==========================================================
  // CHECKOUT
  // ==========================================================

  const checkout = useCallback(async () => {
    const token =
      localStorage.getItem('token')

    if (!token) {
      throw new Error(
        'Debes iniciar sesión para comprar.'
      )
    }

    if (items.length === 0) {
      throw new Error(
        'El carrito está vacío.'
      )
    }

    // Convertimos el carrito a exactamente
    // el formato esperado por FastAPI.
    const pedidoItems = items.map(
      (item) => {
        const productoId =
          obtenerProductoId(item)

        const nombreProducto =
          obtenerNombreProducto(item)

        const precioUnitario =
          obtenerPrecioProducto(item)

        const cantidad =
          obtenerCantidad(item)

        return {
          producto_id: productoId,
          nombre_producto:
            nombreProducto,
          precio_unitario:
            precioUnitario,
          cantidad,
        }
      }
    )

    // ========================================================
    // VALIDACIÓN
    // ========================================================

    const productoInvalido =
      pedidoItems.find(
        (item) =>
          !Number.isInteger(
            item.producto_id
          ) ||
          item.producto_id <= 0 ||
          !item.nombre_producto ||
          !Number.isFinite(
            item.precio_unitario
          ) ||
          item.precio_unitario < 0 ||
          !Number.isInteger(
            item.cantidad
          ) ||
          item.cantidad <= 0
      )

    if (productoInvalido) {
      console.error(
        'Producto inválido enviado al checkout:',
        productoInvalido
      )

      throw new Error(
        'Uno de los productos del carrito tiene información inválida. Elimina ese producto y vuelve a agregarlo.'
      )
    }

    console.log(
      'Enviando pedido:',
      pedidoItems
    )

    // ========================================================
    // ENVIAR PEDIDO
    // ========================================================

    let response

    try {
      response = await fetch(
        `${API_URL}/api/pedidos`,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${token}`,

            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            items: pedidoItems,
          }),
        }
      )
    } catch (error) {
      console.error(
        'Error de conexión con el backend:',
        error
      )

      throw new Error(
        'No se pudo conectar con el servidor. Intenta nuevamente.'
      )
    }

    let data = null

    try {
      data = await response.json()
    } catch {
      data = null
    }

    // ========================================================
    // ERROR DEL BACKEND
    // ========================================================

    if (!response.ok) {
      console.error(
        'Error creando pedido:',
        {
          status: response.status,
          data,
        }
      )

      throw new Error(
        data?.detail ||
        `No se pudo completar la compra. Código: ${response.status}`
      )
    }

    // ========================================================
    // COMPRA EXITOSA
    // ========================================================

    setItems([])

    const usuarioActual =
      obtenerUsuarioId()

    if (usuarioActual) {
      localStorage.removeItem(
        obtenerClaveCarrito(
          usuarioActual
        )
      )
    }

    return data
  }, [items])

  // ==========================================================
  // CONTADOR
  // ==========================================================

  const count = items.reduce(
    (total, item) =>
      total +
      obtenerCantidad(item),
    0
  )

  // ==========================================================
  // TOTAL
  // ==========================================================

  const total = items.reduce(
    (suma, item) => {
      return (
        suma +
        obtenerPrecioProducto(item) *
          obtenerCantidad(item)
      )
    },
    0
  )

  // ==========================================================
  // VALOR DEL CONTEXTO
  // ==========================================================

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clearCartOnLogout,
      checkout,
      count,
      total,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clearCartOnLogout,
      checkout,
      count,
      total,
    ]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// ============================================================
// HOOK
// ============================================================

export function useCart() {
  const context =
    useContext(CartContext)

  if (!context) {
    throw new Error(
      'useCart debe usarse dentro de CartProvider'
    )
  }

  return context
}