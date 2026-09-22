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

// =====================================================
// OBTENER ID DEL USUARIO ACTUAL
// =====================================================

const obtenerUsuarioId = () => {
  try {
    const usuarioGuardado =
      localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      return null
    }

    const usuario =
      JSON.parse(usuarioGuardado)

    if (
      usuario?.id_usuario === undefined ||
      usuario?.id_usuario === null
    ) {
      return null
    }

    return String(usuario.id_usuario)

  } catch {
    return null
  }
}

// =====================================================
// OBTENER CLAVE DEL CARRITO
// =====================================================

const obtenerClaveCarrito = (usuarioId) => {

  if (!usuarioId) {
    return 'cellworld_cart_guest'
  }

  return `cellworld_cart_${usuarioId}`
}

// =====================================================
// OBTENER CARRITO GUARDADO
// =====================================================

const obtenerCarritoGuardado = (usuarioId) => {

  try {

    const clave =
      obtenerClaveCarrito(usuarioId)

    const carrito =
      localStorage.getItem(clave)

    if (!carrito) {
      return []
    }

    const datos =
      JSON.parse(carrito)

    return Array.isArray(datos)
      ? datos
      : []

  } catch {
    return []
  }
}

// =====================================================
// PROVIDER
// =====================================================

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

  // ===================================================
  // GUARDAR CARRITO
  // ===================================================

  useEffect(() => {

    const clave =
      obtenerClaveCarrito(usuarioId)

    /*
     * Si el carrito está vacío,
     * eliminamos la clave de localStorage.
     */
    if (items.length === 0) {

      localStorage.removeItem(clave)

      return
    }

    localStorage.setItem(
      clave,
      JSON.stringify(items)
    )

  }, [items, usuarioId])

  // ===================================================
  // CAMBIO DE USUARIO
  // ===================================================

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

      /*
       * Cambiamos primero el usuario actual.
       */
      setUsuarioId(nuevoId)

      /*
       * Cargamos únicamente el carrito
       * correspondiente al nuevo usuario.
       */
      const nuevoCarrito =
        obtenerCarritoGuardado(nuevoId)

      setItems(nuevoCarrito)
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

  // ===================================================
  // AGREGAR PRODUCTO
  // ===================================================

  const addItem = useCallback((product) => {

    setItems((current) => {

      const existing =
        current.find(
          (item) =>
            item.id === product.id
        )

      if (existing) {

        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        )
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ]
    })

  }, [])

  // ===================================================
  // ELIMINAR PRODUCTO
  // ===================================================

  const removeItem = useCallback((id) => {

    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== id
      )
    )

  }, [])

  // ===================================================
  // ACTUALIZAR CANTIDAD
  // ===================================================

  const updateQuantity = useCallback(
    (id, quantity) => {

      setItems((current) =>
        current
          .map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity,
                }
              : item
          )
          .filter(
            (item) =>
              item.quantity > 0
          )
      )

    },
    []
  )

  // ===================================================
  // VACIAR CARRITO
  // ===================================================

  const clearCart = useCallback(() => {

    setItems([])

    /*
     * Eliminamos directamente el carrito
     * del usuario que está conectado.
     */
    const idActual =
      obtenerUsuarioId()

    if (idActual) {

      localStorage.removeItem(
        obtenerClaveCarrito(idActual)
      )

    }

  }, [])

  // ===================================================
  // CERRAR SESIÓN
  // ===================================================

  const clearCartOnLogout = useCallback(() => {

    /*
     * IMPORTANTE:
     * obtenemos el usuario ANTES de borrar
     * usuario del localStorage.
     */
    const idActual =
      obtenerUsuarioId()

    if (idActual) {

      localStorage.removeItem(
        obtenerClaveCarrito(idActual)
      )

    }

    /*
     * También eliminamos el carrito de invitado
     * por seguridad.
     */
    localStorage.removeItem(
      'cellworld_cart_guest'
    )

    /*
     * Estado React vacío inmediatamente.
     */
    setItems([])

    setUsuarioId(null)

  }, [])

  // ===================================================
  // CHECKOUT
  // ===================================================

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

    const response =
      await fetch(
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
            items: items.map(
              (item) => ({
                producto_id:
                  Number(
                    String(item.id)
                      .replace(
                        'bd-',
                        ''
                      )
                  ) || 0,

                nombre_producto:
                  item.name,

                precio_unitario:
                  item.price,

                cantidad:
                  item.quantity,
              })
            ),
          }),
        }
      )

    const data =
      await response.json()

    if (!response.ok) {

      throw new Error(
        data.detail ||
          'No se pudo completar la compra.'
      )

    }

    /*
     * Compra exitosa:
     * vaciar carrito y eliminarlo
     * del localStorage.
     */
    setItems([])

    const idActual =
      obtenerUsuarioId()

    if (idActual) {

      localStorage.removeItem(
        obtenerClaveCarrito(idActual)
      )

    }

    return data

  }, [items])

  // ===================================================
  // CANTIDAD TOTAL
  // ===================================================

  const count =
    items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    )

  // ===================================================
  // PRECIO TOTAL
  // ===================================================

  const total =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          item.quantity,
      0
    )

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

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

// =====================================================
// HOOK
// =====================================================

// oxlint-disable-next-line react/only-export-components
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