import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'cellworld_cart'

/*
 * ============================================================
 * UTILIDADES
 * ============================================================
 */

const obtenerUsuarioActual = () => {
  try {
    const usuarioGuardado = localStorage.getItem('usuario')

    if (!usuarioGuardado) {
      return null
    }

    const usuario = JSON.parse(usuarioGuardado)

    if (!usuario) {
      return null
    }

    return usuario
  } catch (error) {
    console.error(
      'Error leyendo el usuario de localStorage:',
      error
    )

    return null
  }
}

const obtenerIdUsuario = (usuario) => {
  if (!usuario) {
    return null
  }

  const id =
    usuario.id_usuario ??
    usuario.usuario_id ??
    usuario.id ??
    usuario.user_id

  if (
    id === null ||
    id === undefined ||
    id === ''
  ) {
    return null
  }

  return String(id)
}

const crearClaveCarrito = (usuarioId) => {
  if (!usuarioId) {
    return null
  }

  return `${CART_STORAGE_KEY}_${usuarioId}`
}

const normalizarProducto = (producto) => {
  if (!producto || typeof producto !== 'object') {
    return null
  }

  const id =
    producto.id_producto ??
    producto.producto_id ??
    producto.id

  if (
    id === null ||
    id === undefined ||
    id === ''
  ) {
    return null
  }

  const nombre =
    producto.nombre_producto ??
    producto.nombre ??
    'Producto'

  const precio =
    Number(
      producto.precio ??
      producto.precio_unitario ??
      producto.precio_venta ??
      0
    ) || 0

  const imagen =
    producto.imagen ??
    producto.imagen_url ??
    producto.url_imagen ??
    ''

  return {
    ...producto,
    id_producto: Number(id),
    nombre_producto: String(nombre),
    precio,
    imagen,
  }
}

const normalizarCarrito = (carrito) => {
  if (!Array.isArray(carrito)) {
    return []
  }

  return carrito
    .map((item) => {
      const producto = normalizarProducto(item)

      if (!producto) {
        return null
      }

      const cantidad =
        Number(item.cantidad) || 1

      return {
        ...producto,
        cantidad:
          Math.max(1, Math.floor(cantidad)),
      }
    })
    .filter(Boolean)
}

/*
 * ============================================================
 * PROVIDER
 * ============================================================
 */

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([])
  const [usuarioId, setUsuarioId] = useState(() => {
    return obtenerIdUsuario(
      obtenerUsuarioActual()
    )
  })

  const [comprando, setComprando] =
    useState(false)

  /*
   * ==========================================================
   * CARGAR CARRITO DEL USUARIO
   * ==========================================================
   */

  const cargarCarritoUsuario = useCallback(
    (idUsuario) => {
      if (!idUsuario) {
        setCarrito([])
        return
      }

      const clave =
        crearClaveCarrito(idUsuario)

      if (!clave) {
        setCarrito([])
        return
      }

      try {
        const guardado =
          localStorage.getItem(clave)

        if (!guardado) {
          setCarrito([])
          return
        }

        const carritoParseado =
          JSON.parse(guardado)

        setCarrito(
          normalizarCarrito(
            carritoParseado
          )
        )
      } catch (error) {
        console.error(
          'Error cargando el carrito:',
          error
        )

        setCarrito([])

        try {
          localStorage.removeItem(clave)
        } catch {
          // No hacer nada si localStorage falla.
        }
      }
    },
    []
  )

  /*
   * ==========================================================
   * DETECTAR USUARIO INICIAL
   * ==========================================================
   */

  useEffect(() => {
    const usuario =
      obtenerUsuarioActual()

    const id =
      obtenerIdUsuario(usuario)

    setUsuarioId(id)

    cargarCarritoUsuario(id)
  }, [cargarCarritoUsuario])

  /*
   * ==========================================================
   * ESCUCHAR CAMBIOS DE USUARIO
   * ==========================================================
   */

  useEffect(() => {
    const manejarCambioUsuario = (
      evento
    ) => {
      const usuario =
        obtenerUsuarioActual()

      const idDesdeEvento =
        evento?.detail?.userId

      const nuevoId =
        idDesdeEvento !== undefined
          ? idDesdeEvento
            ? String(idDesdeEvento)
            : null
          : obtenerIdUsuario(usuario)

      setUsuarioId(nuevoId)

      cargarCarritoUsuario(nuevoId)
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

  /*
   * ==========================================================
   * GUARDAR CARRITO
   * ==========================================================
   */

  useEffect(() => {
    if (!usuarioId) {
      return
    }

    const clave =
      crearClaveCarrito(usuarioId)

    if (!clave) {
      return
    }

    try {
      localStorage.setItem(
        clave,
        JSON.stringify(carrito)
      )
    } catch (error) {
      console.error(
        'Error guardando el carrito:',
        error
      )
    }
  }, [carrito, usuarioId])

  /*
   * ==========================================================
   * AGREGAR PRODUCTO
   * ==========================================================
   */

  const agregarAlCarrito = useCallback(
    (producto) => {
      const usuario =
        obtenerUsuarioActual()

      const id =
        obtenerIdUsuario(usuario)

      if (!id) {
        throw new Error(
          'Debes iniciar sesión para agregar productos al carrito.'
        )
      }

      const productoNormalizado =
        normalizarProducto(producto)

      if (!productoNormalizado) {
        console.error(
          'Producto inválido:',
          producto
        )

        return
      }

      setUsuarioId(id)

      setCarrito((carritoActual) => {
        const indice =
          carritoActual.findIndex(
            (item) =>
              Number(
                item.id_producto
              ) ===
              Number(
                productoNormalizado.id_producto
              )
          )

        if (indice === -1) {
          return [
            ...carritoActual,
            {
              ...productoNormalizado,
              cantidad: 1,
            },
          ]
        }

        return carritoActual.map(
          (item, index) => {
            if (index !== indice) {
              return item
            }

            return {
              ...item,
              cantidad:
                Number(item.cantidad || 0) +
                1,
            }
          }
        )
      })
    },
    []
  )

  /*
   * ==========================================================
   * AGREGAR CON CANTIDAD
   * ==========================================================
   */

  const agregarProducto = useCallback(
    (producto, cantidad = 1) => {
      const usuario =
        obtenerUsuarioActual()

      const id =
        obtenerIdUsuario(usuario)

      if (!id) {
        throw new Error(
          'Debes iniciar sesión para agregar productos al carrito.'
        )
      }

      const productoNormalizado =
        normalizarProducto(producto)

      if (!productoNormalizado) {
        return
      }

      const cantidadNumerica =
        Math.max(
          1,
          Math.floor(
            Number(cantidad) || 1
          )
        )

      setUsuarioId(id)

      setCarrito((carritoActual) => {
        const existe =
          carritoActual.some(
            (item) =>
              Number(
                item.id_producto
              ) ===
              Number(
                productoNormalizado.id_producto
              )
          )

        if (!existe) {
          return [
            ...carritoActual,
            {
              ...productoNormalizado,
              cantidad: cantidadNumerica,
            },
          ]
        }

        return carritoActual.map(
          (item) => {
            if (
              Number(
                item.id_producto
              ) !==
              Number(
                productoNormalizado.id_producto
              )
            ) {
              return item
            }

            return {
              ...item,
              cantidad:
                Number(item.cantidad || 0) +
                cantidadNumerica,
            }
          }
        )
      })
    },
    []
  )

  /*
   * ==========================================================
   * AUMENTAR CANTIDAD
   * ==========================================================
   */

  const aumentarCantidad = useCallback(
    (productoId) => {
      if (
        productoId === null ||
        productoId === undefined
      ) {
        return
      }

      setCarrito((carritoActual) =>
        carritoActual.map((item) => {
          if (
            Number(item.id_producto) !==
            Number(productoId)
          ) {
            return item
          }

          return {
            ...item,
            cantidad:
              Number(item.cantidad || 0) + 1,
          }
        })
      )
    },
    []
  )

  /*
   * ==========================================================
   * DISMINUIR CANTIDAD
   * ==========================================================
   */

  const disminuirCantidad =
    useCallback(
      (productoId) => {
        if (
          productoId === null ||
          productoId === undefined
        ) {
          return
        }

        setCarrito((carritoActual) =>
          carritoActual
            .map((item) => {
              if (
                Number(item.id_producto) !==
                Number(productoId)
              ) {
                return item
              }

              const nuevaCantidad =
                Number(item.cantidad || 1) -
                1

              return {
                ...item,
                cantidad:
                  nuevaCantidad,
              }
            })
            .filter(
              (item) =>
                Number(item.cantidad) > 0
            )
        )
      },
      []
    )

  /*
   * ==========================================================
   * ACTUALIZAR CANTIDAD
   * ==========================================================
   */

  const actualizarCantidad =
    useCallback(
      (productoId, cantidad) => {
        if (
          productoId === null ||
          productoId === undefined
        ) {
          return
        }

        const nuevaCantidad =
          Math.floor(
            Number(cantidad)
          )

        setCarrito((carritoActual) =>
          carritoActual
            .map((item) => {
              if (
                Number(item.id_producto) !==
                Number(productoId)
              ) {
                return item
              }

              return {
                ...item,
                cantidad:
                  nuevaCantidad,
              }
            })
            .filter(
              (item) =>
                Number(item.cantidad) > 0
            )
        )
      },
      []
    )

  /*
   * ==========================================================
   * COMPATIBILIDAD CON updateQuantity
   * ==========================================================
   */

  const updateQuantity =
    useCallback(
      (productoId, cantidad) => {
        actualizarCantidad(
          productoId,
          cantidad
        )
      },
      [actualizarCantidad]
    )

  /*
   * ==========================================================
   * ELIMINAR PRODUCTO
   * ==========================================================
   */

  const eliminarDelCarrito =
    useCallback((productoId) => {
      if (
        productoId === null ||
        productoId === undefined
      ) {
        return
      }

      setCarrito((carritoActual) =>
        carritoActual.filter(
          (item) =>
            Number(item.id_producto) !==
            Number(productoId)
        )
      )
    }, [])

  /*
   * ==========================================================
   * COMPATIBILIDAD CON removeItem
   * ==========================================================
   */

  const removeItem =
    useCallback(
      (productoId) => {
        eliminarDelCarrito(
          productoId
        )
      },
      [eliminarDelCarrito]
    )

  /*
   * ==========================================================
   * LIMPIAR CARRITO
   * ==========================================================
   */

  const limpiarCarrito =
    useCallback(() => {
      setCarrito([])
    }, [])

  /*
   * ==========================================================
   * COMPATIBILIDAD CON clearCart
   * ==========================================================
   */

  const clearCart =
    useCallback(() => {
      limpiarCarrito()
    }, [limpiarCarrito])

  /*
   * ==========================================================
   * LIMPIAR CARRITO AL CERRAR SESIÓN
   * ==========================================================
   */

  const clearCartOnLogout =
    useCallback(() => {
      const usuario =
        obtenerUsuarioActual()

      const id =
        obtenerIdUsuario(usuario)

      if (id) {
        const clave =
          crearClaveCarrito(id)

        try {
          localStorage.removeItem(
            clave
          )
        } catch (error) {
          console.error(
            'Error limpiando carrito:',
            error
          )
        }
      }

      setCarrito([])
      setUsuarioId(null)
    }, [])

  /*
   * ==========================================================
   * CANTIDAD TOTAL
   * ==========================================================
   */

  const count = useMemo(() => {
    return carrito.reduce(
      (total, item) =>
        total +
        Number(item.cantidad || 0),
      0
    )
  }, [carrito])

  /*
   * ==========================================================
   * TOTAL DEL CARRITO
   * ==========================================================
   */

  const total = useMemo(() => {
    return carrito.reduce(
      (suma, item) => {
        const precio =
          Number(item.precio) || 0

        const cantidad =
          Number(item.cantidad) || 0

        return (
          suma +
          precio * cantidad
        )
      },
      0
    )
  }, [carrito])

  /*
   * ==========================================================
   * TOTAL DE UN PRODUCTO
   * ==========================================================
   */

  const obtenerSubtotal = useCallback(
    (item) => {
      if (!item) {
        return 0
      }

      return (
        (Number(item.precio) || 0) *
        (Number(item.cantidad) || 0)
      )
    },
    []
  )

  /*
   * ==========================================================
   * CHECKOUT
   * ==========================================================
   */

  const checkout = useCallback(
    async () => {
      if (comprando) {
        throw new Error(
          'Ya se está procesando una compra.'
        )
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

      if (!carrito.length) {
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

      setComprando(true)

      try {
        const detalle = carrito.map(
          (item) => ({
            producto_id:
              Number(
                item.id_producto
              ),

            nombre_producto:
              item.nombre_producto,

            precio_unitario:
              Number(item.precio) || 0,

            cantidad:
              Number(item.cantidad) || 1,
          })
        )

        const respuesta =
          await fetch(
            'http://127.0.0.1:8000/api/pedidos',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                usuario_id:
                  Number(idUsuario),

                total:
                  Number(total),

                estado: 'pagado',

                productos:
                  detalle,
              }),
            }
          )

        let data = null

        try {
          data =
            await respuesta.json()
        } catch {
          data = null
        }

        if (!respuesta.ok) {
          throw new Error(
            data?.detail ||
              data?.message ||
              'No se pudo realizar la compra.'
          )
        }

        /*
         * Solo vaciamos el carrito después
         * de que el backend confirme la compra.
         */

        setCarrito([])

        const clave =
          crearClaveCarrito(idUsuario)

        try {
          localStorage.removeItem(
            clave
          )
        } catch (error) {
          console.error(
            'No se pudo limpiar localStorage:',
            error
          )
        }

        return data
      } finally {
        setComprando(false)
      }
    },
    [
      carrito,
      comprando,
      total,
    ]
  )

  /*
   * ==========================================================
   * VALORES DEL CONTEXTO
   * ==========================================================
   */

  const value = useMemo(
    () => ({
      carrito,

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

      limpiarCarrito,

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
      updateQuantity,
      eliminarDelCarrito,
      removeItem,
      limpiarCarrito,
      clearCart,
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

/*
 * ============================================================
 * HOOK
 * ============================================================
 */

export function useCart() {
  const contexto =
    useContext(CartContext)

  if (!contexto) {
    throw new Error(
      'useCart debe utilizarse dentro de CartProvider.'
    )
  }

  return contexto
}

export default CartContext