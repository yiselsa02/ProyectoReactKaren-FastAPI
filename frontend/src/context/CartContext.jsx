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
// OBTENER ID DE PRODUCTO
// ============================================================

const obtenerProductoId = (item) => {
  let id =
    item?.id_producto ??
    item?.id ??
    item?.producto_id

  if (
    typeof id === 'string'
  ) {
    id = id.replace(
      /^bd-/,
      ''
    )
  }

  const numero =
    Number(id)

  return Number.isInteger(numero) &&
    numero > 0
    ? numero
    : null
}


// ============================================================
// OBTENER NOMBRE DEL PRODUCTO
// ============================================================

const obtenerNombreProducto = (item) => {
  return (
    item?.nombre ??
    item?.name ??
    item?.nombre_producto ??
    ''
  )
}


// ============================================================
// OBTENER PRECIO DEL PRODUCTO
// ============================================================

const obtenerPrecioProducto = (item) => {
  const precio =
    Number(
      item?.precio ??
      item?.price ??
      item?.precio_unitario ??
      0
    )

  return Number.isFinite(precio)
    ? precio
    : 0
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
      obtenerProductoId(product)

    const nombreProducto =
      obtenerNombreProducto(product)

    const precioProducto =
      obtenerPrecioProducto(product)


    // Si el producto no tiene ID válido,
    // no lo agregamos al carrito.
    if (!productoId) {
      console.error(
        'No se pudo agregar el producto al carrito:',
        product
      )

      return
    }


    setItems((current) => {

      const existing =
        current.find((item) => {

          const idExistente =
            obtenerProductoId(item)

          return (
            idExistente !== null &&
            idExistente === productoId
          )
        })


      if (existing) {

        return current.map((item) => {

          const idExistente =
            obtenerProductoId(item)

          if (
            idExistente !== productoId
          ) {
            return item
          }

          return {
            ...item,

            // Mantenemos ambos nombres
            // para compatibilidad con la interfaz.
            id: productoId,
            id_producto: productoId,

            name:
              item?.name ??
              nombreProducto,

            nombre:
              item?.nombre ??
              nombreProducto,

            price:
              Number(
                item?.price ??
                precioProducto
              ),

            precio:
              Number(
                item?.precio ??
                precioProducto
              ),

            quantity:
              Number(
                item?.quantity || 0
              ) + 1,
          }

        })
      }


      return [
        ...current,

        {
          ...product,

          // IDs compatibles
          id: productoId,
          id_producto: productoId,

          // Nombres compatibles
          name: nombreProducto,
          nombre: nombreProducto,

          // Precios compatibles
          price: precioProducto,
          precio: precioProducto,

          quantity: 1,
        },
      ]
    })

  }, [])


  // ==========================================================
  // ELIMINAR PRODUCTO
  // ==========================================================

  const removeItem = useCallback((id) => {

    let idBuscado = id

    if (
      typeof idBuscado === 'object' &&
      idBuscado !== null
    ) {
      idBuscado =
        obtenerProductoId(idBuscado)
    }

    if (
      typeof idBuscado === 'string'
    ) {
      idBuscado =
        idBuscado.replace(
          /^bd-/,
          ''
        )
    }

    idBuscado =
      Number(idBuscado)


    setItems((current) =>
      current.filter((item) => {

        const itemId =
          obtenerProductoId(item)

        return (
          itemId !== idBuscado
        )
      })
    )

  }, [])


  // ==========================================================
  // ACTUALIZAR CANTIDAD
  // ==========================================================

  const updateQuantity = useCallback(
    (id, quantity) => {

      let idBuscado = id

      if (
        typeof idBuscado === 'object' &&
        idBuscado !== null
      ) {
        idBuscado =
          obtenerProductoId(idBuscado)
      }

      if (
        typeof idBuscado === 'string'
      ) {
        idBuscado =
          idBuscado.replace(
            /^bd-/,
            ''
          )
      }

      idBuscado =
        Number(idBuscado)


      const nuevaCantidad =
        Number(quantity)


      setItems((current) =>
        current
          .map((item) => {

            const itemId =
              obtenerProductoId(item)

            if (
              itemId !== idBuscado
            ) {
              return item
            }

            return {
              ...item,
              quantity:
                nuevaCantidad,
            }
          })
          .filter(
            (item) =>
              Number(
                item.quantity
              ) > 0
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


    const pedidoItems =
      items.map((item) => {

        const productoId =
          obtenerProductoId(item)

        const nombreProducto =
          obtenerNombreProducto(item)

        const precioUnitario =
          obtenerPrecioProducto(item)

        const cantidad =
          Number(
            item?.quantity ??
            item?.cantidad ??
            0
          )


        return {
          producto_id:
            productoId,

          nombre_producto:
            nombreProducto,

          precio_unitario:
            precioUnitario,

          cantidad,
        }
      })


    // ========================================================
    // VALIDAR PEDIDO
    // ========================================================

    const itemInvalido =
      pedidoItems.find(
        (item) =>
          !item.producto_id ||
          !item.nombre_producto ||
          !Number.isInteger(
            item.producto_id
          ) ||
          item.producto_id < 1 ||
          !Number.isFinite(
            item.precio_unitario
          ) ||
          item.precio_unitario < 0 ||
          !Number.isInteger(
            item.cantidad
          ) ||
          item.cantidad < 1
      )


    if (itemInvalido) {

      console.error(
        'Producto inválido enviado al checkout:',
        itemInvalido
      )

      throw new Error(
        'Uno de los productos del carrito tiene información inválida. Vuelve a agregar ese producto al carrito.'
      )
    }


    console.log(
      'Enviando pedido:',
      pedidoItems
    )


    // ========================================================
    // PETICIÓN AL BACKEND
    // ========================================================

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


    // ========================================================
    // ERROR
    // ========================================================

    if (!response.ok) {

      console.error(
        'Error creando pedido:',
        {
          status:
            response.status,

          data,
        }
      )

      throw new Error(
        data?.detail ||
        'No se pudo completar la compra.'
      )
    }


    // ========================================================
    // COMPRA EXITOSA
    // ========================================================

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


  // ==========================================================
  // CONTADORES
  // ==========================================================

  const count =
    items.reduce(
      (total, item) =>
        total +
        Number(
          item?.quantity || 0
        ),
      0
    )


  const total =
    items.reduce(
      (sum, item) => {

        const precio =
          obtenerPrecioProducto(item)

        return (
          sum +
          precio *
          Number(
            item?.quantity || 0
          )
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