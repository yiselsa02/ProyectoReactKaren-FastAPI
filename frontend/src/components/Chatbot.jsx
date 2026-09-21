import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Send, X } from 'lucide-react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

const SUGGESTIONS = [
  'Quiero saber más de los productos',
  '¿Cómo hago un pedido?',
  'Necesito ayuda con mi cuenta',
  'Quiero reportar un problema',
]

function obtenerRespuesta(texto, numeroRespuesta = 0) {
  const mensaje = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const seleccionar = (respuestas) =>
    respuestas[numeroRespuesta % respuestas.length]

  if (/(pedido|comprar|compra|carrito|orden)/.test(mensaje)) {
    return seleccionar([
      'Para comprar, entra a Productos, agrega los equipos al carrito y revisa el resumen antes de confirmar el pedido.',
      'Puedes armar tu carrito desde el catálogo. Cuando termines, abre el carrito para revisar cantidades, total y continuar con la compra.',
      'El proceso es sencillo: elige un producto, selecciona Agregar al carrito y luego confirma tu pedido desde el botón del carrito.',
    ])
  }

  if (/(envio|entrega|domicilio|recibir|direccion)/.test(mensaje)) {
    return seleccionar([
      'Para coordinar la entrega, mantén actualizada tu dirección y teléfono en tu perfil. Nuestro equipo revisará los datos del pedido.',
      'La información de entrega se toma de los datos de tu cuenta. Puedes revisarlos desde Mi perfil antes de realizar el pedido.',
      '¿Quieres consultar una entrega específica? Ten a mano el número de pedido y escríbenos por WhatsApp o registra una PQR.',
    ])
  }

  if (/(pago|pagar|tarjeta|efectivo|transferencia|factura)/.test(mensaje)) {
    return seleccionar([
      'El total de tu compra se calcula automáticamente en el carrito. Si necesitas soporte con el pago o la factura, registra una PQR.',
      'Puedes revisar el valor total antes de confirmar el pedido. La información de tus compras queda disponible en tu panel de cliente.',
      'Para solicitar ayuda con una factura, indica el número del pedido en tu PQR y el equipo administrativo podrá revisarlo.',
    ])
  }

  if (/(producto|catalogo|telefono|celular|iphone|samsung|android|accesorio)/.test(mensaje)) {
    return seleccionar([
      'En el catálogo encontrarás celulares y accesorios organizados por categoría, con precio, stock y características de cada producto.',
      'Puedes comparar los equipos revisando almacenamiento, RAM, color, precio y disponibilidad antes de agregarlos al carrito.',
      'Si buscas un modelo específico, escríbeme la marca, el presupuesto o una característica y te indicaré cómo encontrarlo en Productos.',
    ])
  }

  if (/(precio|costo|valor|barato|presupuesto|oferta)/.test(mensaje)) {
    return seleccionar([
      'Los precios vigentes aparecen directamente en cada tarjeta del catálogo y se actualizan desde el inventario de CellWorld.',
      'Para encontrar una opción económica, revisa el catálogo y compara precio, almacenamiento y RAM entre varios equipos.',
      'El valor final puedes confirmarlo en el carrito antes de enviar el pedido.',
    ])
  }

  if (/(garantia|garantias|danado|defecto|reparacion|problema)/.test(mensaje)) {
    return seleccionar([
      'Si recibiste un producto con inconvenientes, conserva la información del pedido y registra una PQR con una descripción detallada.',
      'Para reportar una falla o solicitar soporte, usa Contacto o la sección PQR de tu panel de cliente.',
      'Cuéntanos qué ocurrió, cuándo recibiste el equipo y cuál es el número del pedido para que el equipo pueda revisarlo.',
    ])
  }

  if (/(pqr|reclamo|queja|peticion|sugerencia|soporte)/.test(mensaje)) {
    return seleccionar([
      'Las PQR permiten enviar peticiones, quejas, reclamos y sugerencias. Puedes registrarlas desde Contacto si tienes una cuenta de cliente.',
      'Después de enviar una PQR, consulta su estado desde Mis PQR. Allí también verás la respuesta del administrador o empleado.',
      'Para que soporte pueda ayudarte mejor, incluye asunto, descripción, número de pedido y cualquier dato relevante.',
    ])
  }

  if (/(cuenta|login|iniciar sesion|registro|contrasena|perfil)/.test(mensaje)) {
    return seleccionar([
      'Desde Iniciar sesión puedes entrar a tu cuenta o registrarte si todavía no tienes una.',
      'Si olvidaste tu contraseña, usa la opción de recuperación en la pantalla de inicio de sesión.',
      'En Mi perfil puedes revisar tus datos y consultar tus compras, favoritos y PQR.',
    ])
  }

  if (/(hola|buenas|hey|gracias|perfecto)/.test(mensaje)) {
    return seleccionar([
      '¡Hola! Soy CellBot. Puedo orientarte con productos, pedidos, pagos, cuenta y soporte.',
      '¡Qué gusto ayudarte! Pregúntame por el catálogo, una compra, una PQR o tu cuenta.',
      '¡Bienvenido a CellWorld! Dime qué necesitas encontrar y te indico el siguiente paso.',
    ])
  }

  return seleccionar([
    'Puedo ayudarte con el catálogo, precios, pedidos, pagos, entregas, garantías, cuenta y PQR. ¿Qué tema necesitas revisar?',
    'No quiero darte una respuesta al azar. ¿Tu consulta es sobre un producto, una compra, tu cuenta o soporte?',
    'Estoy aquí para orientarte en CellWorld. Prueba preguntando por un celular, un pedido, una factura o una PQR.',
  ])
}

function Chatbot({ modoOscuro = false }) {
  const [abierto, setAbierto] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy CellBot. ¿En qué puedo ayudarte con tu compra o con tu experiencia en CellWorld?',
    },
  ])
  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth - 180 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight - 88 : 0,
  })

  const dragState = useRef(null)
  const finalMensajesRef = useRef(null)

  useEffect(() => {
    finalMensajesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, abierto])

  useEffect(() => {
    if (!abierto) return

    const manejarMovimiento = (event) => {
      if (!dragState.current) return

      const deltaX = event.clientX - dragState.current.startX
      const deltaY = event.clientY - dragState.current.startY

      const maxX = Math.max(12, window.innerWidth - 390)
      const maxY = Math.max(12, window.innerHeight - 470)

      setPosition({
        x: Math.min(maxX, Math.max(12, dragState.current.originX + deltaX)),
        y: Math.min(maxY, Math.max(12, dragState.current.originY + deltaY)),
      })
    }

    const detenerArrastre = () => {
      dragState.current = null
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', manejarMovimiento)
    window.addEventListener('mouseup', detenerArrastre)

    return () => {
      window.removeEventListener('mousemove', manejarMovimiento)
      window.removeEventListener('mouseup', detenerArrastre)
      document.body.style.userSelect = ''
    }
  }, [abierto])

  useEffect(() => {
    if (typeof window === 'undefined') return

    setPosition({
      x: abierto ? window.innerWidth - 390 : window.innerWidth - 180,
      y: abierto ? window.innerHeight - 470 : window.innerHeight - 88,
    })
  }, [abierto])

  const quickActions = useMemo(
    () => SUGGESTIONS,
    []
  )

  const iniciarArrastre = (event) => {
    if (event.button !== 0) return

    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    }

    document.body.style.userSelect = 'none'
  }

  const enviarMensaje = async (texto = mensaje) => {
    const textoLimpio = String(texto || '').trim()

    if (!textoLimpio) {
      return
    }

    const nuevoUsuario = {
      id: Date.now(),
      sender: 'user',
      text: textoLimpio,
    }

    setMensajes((actual) => [...actual, nuevoUsuario])
    setMensaje('')

    try {
      const historial = [...mensajes, nuevoUsuario]
        .slice(-20)
        .map((item) => ({
          role: item.sender === 'user' ? 'user' : 'assistant',
          content: item.text,
        }))

      const respuesta = await fetch(`${API_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textoLimpio,
          history: historial,
        }),
      })

      const data = await respuesta.json().catch(() => null)

      if (!respuesta.ok || typeof data?.reply !== 'string') {
        throw new Error('IA no disponible')
      }

      setMensajes((actual) => [
        ...actual,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.reply,
        },
      ])
    } catch {
      window.setTimeout(() => {
        const respuestaBot = {
          id: Date.now() + 1,
          sender: 'bot',
          text: obtenerRespuesta(textoLimpio, mensajes.length),
        }

        setMensajes((actual) => [...actual, respuestaBot])
      }, 350)
    }
  }

  const panelClass = modoOscuro
    ? 'border-slate-700 bg-slate-900 text-white shadow-[0_20px_45px_rgba(15,23,42,0.6)]'
    : 'border-slate-200 bg-white text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.18)]'

  const inputClass = modoOscuro
    ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-400'
    : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400'

  const messageBotClass = modoOscuro
    ? 'bg-slate-800 text-slate-100'
    : 'bg-slate-100 text-slate-700'

  return (
    <div
      className="fixed z-30"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {abierto ? (
        <div className={`flex h-[430px] w-[350px] flex-col overflow-hidden rounded-2xl border ${panelClass}`}>
          <div
            className={`flex cursor-grab items-center justify-between border-b px-4 py-3 active:cursor-grabbing ${modoOscuro ? 'border-slate-700' : 'border-slate-200'}`}
            onMouseDown={iniciarArrastre}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30">
                <Bot size={16} />
              </div>

              <div>
                <p className="text-sm font-bold">CellBot</p>
                <p className={`text-[10px] ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                  Asistente en línea
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAbierto(false)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${modoOscuro ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              aria-label="Cerrar chatbot"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-3">
              {mensajes.map((item) => (
                <div
                  key={item.id}
                  className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      item.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : `${messageBotClass}`
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}

              <div ref={finalMensajesRef} />
            </div>
          </div>

          <div className={`border-t px-3 py-2 ${modoOscuro ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="mb-2 flex flex-wrap gap-2">
              {quickActions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => enviarMensaje(option)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                    modoOscuro
                      ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                enviarMensaje()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={mensaje}
                onChange={(event) => setMensaje(event.target.value)}
                placeholder="Escribe tu mensaje..."
                className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500 ${inputClass}`}
              />

              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500"
                aria-label="Enviar mensaje"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-500 via-cyan-400 to-indigo-500 text-white shadow-[0_18px_35px_rgba(59,130,246,0.45)] transition-all duration-300 hover:-translate-y-1 hover:scale-105"
          aria-label="Abrir chatbot"
        >
          <span className="pointer-events-none absolute inset-1 rounded-[22px] border border-white/30" />

          <span className="pointer-events-none relative flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/40 bg-white/10 backdrop-blur-sm">
            <span className="relative flex h-7 w-7 items-center justify-center">
              <span className="absolute -top-0.5 left-1.5 h-1.5 w-1.5 rounded-full bg-slate-900" />
              <span className="absolute -top-0.5 right-1.5 h-1.5 w-1.5 rounded-full bg-slate-900" />
              <span className="absolute bottom-1.5 left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-full border-b-2 border-slate-900" />
              <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-900/80" />
            </span>
          </span>

          <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white">
            <span className="h-2 w-2 rounded-full bg-emerald-700" />
          </span>
        </button>
      )}
    </div>
  )
}

export default Chatbot
