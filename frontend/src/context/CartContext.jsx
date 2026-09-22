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
// OBTENER ID DEL USUARIO
// ============================================================

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
// OBTENER CARRITO GUARDADO
// ============================================================

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
  // CAMBIO DE USUARIO
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


  // ==========================================================
  // AGREGAR PRODUCTO
  // ==========================================================

  const addItem = useCallback((product) => {

    const productoId =
      product?.id_producto ??
      product?.id ??
      product?.producto_id

    const nombreProducto =
      product?.nombre ??
      product?.name ??
      product?.nombre_producto ??
      'Producto'

    const precioProducto =
      Number(
        product?.precio ??
        product?.price ??
        product?.precio_unitario ??
        0
      )


    setItems((current) => {

      const existing =
        current.find((item) => {

          const idExistente =
            item?.id_producto ??
            item?.id ??
            item?.producto_id

          return String(idExistente) ===
            String(productoId)
        })


      if (existing) {

        return current.map((item) => {

          const idExistente =
            item?.id_producto ??
            item?.id ??
            item?.producto_id

          if (
            String(idExistente) !==
            String(productoId)
          ) {
            return item
          }

          return {
            ...item,
            quantity:
              Number(item.quantity || 0) + 1,
          }

        })
      }


      return [
        ...current,
        {
          ...product,

          id_producto:
            Number(productoId),

          nombre:
            nombreProducto,

          precio:
            precioProducto,

          quantity: 1,
        },
      ]
    })

  }, [])


  // ==========================================================
  // ELIMINAR PRODUCTO
  // ==========================================================

  const removeItem = useCallback((id) => {

    setItems((current) =>
      current.filter((item) => {

        const itemId =
          item?.id_producto ??
          item?.id ??
          item?.producto_id

        return String(itemId) !==
          String(id)
      })
    )

  }, [])


  // ==========================================================
  // ACTUALIZAR CANTIDAD
  // ==========================================================

  const updateQuantity = useCallback(
    (id, quantity) => {

      const nuevaCantidad =
        Number(quantity)

      setItems((current) =>
        current
          .map((item) => {

            const itemId =
              item?.id_producto ??
              item?.id ??
              item?.producto_id

            if (
              String(itemId) !==
              String(id)
            ) {
              return item
            }

            return {
              ...item,
              quantity: nuevaCantidad,
            }
          })
          .filter(
            (item) =>
              Number(item.quantity) > 0
          )
      )
    },
    []
  )


  // ==========================================================
  // LIMPIAR CARRITO
  // ==========================================================

  const clearCart = useCallback(() => {

    setItems([])

    const idActual =
      obtenerUsuarioId()

    if (idActual) {
      localStorage.removeItem(
        obtenerClaveCarrito(idActual)
      )
    }

  }, [])


  // ==========================================================
  // LIMPIAR AL CERRAR SESIÓN
  // ==========================================================

  const clearCartOnLogout = useCallback(() => {

    const idActual =
      obtenerUsuarioId()

    if (idActual) {
      localStorage.removeItem(
        obtenerClaveCarrito(idActual)
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


    // --------------------------------------------------------
    // CONSTRUIR ITEMS DEL PEDIDO
    // --------------------------------------------------------

    const pedidoItems =
      items.map((item) => {

        let productoId =
          item?.id_producto ??
          item?.id ??
          item?.producto_id


        // Por si algún carrito antiguo tiene
        // valores como "bd-5".
        if (
          typeof productoId === 'string'
        ) {
          productoId =
            productoId.replace(
              /^bd-/,
              ''
            )
        }


        productoId =
          Number(productoId)


        const nombreProducto =
          item?.nombre ??
          item?.name ??
          item?.nombre_producto


        const precioUnitario =
          Number(
            item?.precio ??
            item?.price ??
            item?.precio_unitario ??
            0
          )


        const cantidad =
          Number(
            item?.quantity ??
            item?.cantidad ??
            0
          )


        return {
          producto_id: productoId,
          nombre_producto:
            nombreProducto,
          precio_unitario:
            precioUnitario,
          cantidad,
        }
      })


    // --------------------------------------------------------
    // VALIDAR ANTES DE ENVIAR
    // --------------------------------------------------------

    const itemInvalido =
      pedidoItems.find(
        (item) =>
          !Number.isInteger(
            item.producto_id
          ) ||
          item.producto_id < 1 ||
          !item.nombre_producto ||
          item.precio_unitario < 0 ||
          item.cantidad < 1
      )


    if (itemInvalido) {
      console.error(
        'Producto inválido enviado al checkout:',
        itemInvalido
      )

      throw new Error(
        'Uno de los productos del carrito no tiene información válida. Elimina el producto del carrito y vuelve a agregarlo.'
      )
    }


    // --------------------------------------------------------
    // PETICIÓN
    // --------------------------------------------------------

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
            items: pedidoItems,
          }),
        }
      )


    let data

    try {
      data =
        await response.json()
    } catch {
      data = null
    }


    // --------------------------------------------------------
    // ERROR DEL BACKEND
    // --------------------------------------------------------

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
        'No se pudo completar la compra.'
      )
    }


    // --------------------------------------------------------
    // COMPRA EXITOSA
    // --------------------------------------------------------

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


  // ============================================================
  // CONTADORES
  // ============================================================

  const count =
    items.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    )


  const total =
    items.reduce(
      (sum, item) => {

        const precio =
          Number(
            item?.precio ??
            item?.price ??
            item?.precio_unitario ??
            0
          )

        return (
          sum +
          precio *
          Number(
            item.quantity || 0
          )
        )
      },
      0
    )


  // ============================================================
  // VALOR DEL CONTEXTO
  // ============================================================

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
    <CartContext.Provider
      value={value}
    >
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