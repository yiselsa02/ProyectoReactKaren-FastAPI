import { X } from 'lucide-react'
import { useState } from 'react'
import whatsapp from '../assets/whatsapp.png'

function WhatsAppButton() {
  const [mostrarMenu, setMostrarMenu] = useState(false)

  const numeroWhatsApp = '+573005551234' // Reemplazar con número real
  const mensajeDefault = 'Hola, me gustaría más información sobre los productos de CellWorld'

  const abrirWhatsApp = (mensaje = '') => {
    const texto = mensaje || mensajeDefault
    const enlace = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`
    window.open(enlace, '_blank')
    setMostrarMenu(false)
  }

  return (
    <div className="group fixed bottom-6 right-6 z-40">
      {/* MENÚ FLOTANTE */}
      {mostrarMenu && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-2xl dark:bg-gray-800">
          
          {/* OPCIÓN 1 */}
          <button
            onClick={() => abrirWhatsApp('Hola, tengo una consulta sobre un producto')}
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>📱</span>
            <span>Consulta por producto</span>
          </button>

          {/* OPCIÓN 2 */}
          <button
            onClick={() => abrirWhatsApp('Hola, me gustaría hacer un pedido')}
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>🛒</span>
            <span>Realizar un pedido</span>
          </button>

          {/* OPCIÓN 3 */}
          <button
            onClick={() => abrirWhatsApp('Hola, tengo un problema con mi compra')}
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>❓</span>
            <span>Soporte técnico</span>
          </button>

          {/* OPCIÓN 4 */}
          <button
            onClick={() => abrirWhatsApp()}
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>💬</span>
            <span>Mensaje personalizado</span>
          </button>

        </div>
      )}

      {/* BOTÓN PRINCIPAL */}
      <button
        onClick={() => setMostrarMenu(!mostrarMenu)}
        className={`flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-110 ${
          mostrarMenu
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-transparent'
        }`}
        title={mostrarMenu ? 'Cerrar menú' : 'Abrir WhatsApp'}
      >
        {mostrarMenu ? (
          <X size={24} strokeWidth={3} />
        ) : (
          <img
            src={whatsapp}
            alt="WhatsApp"
            className="h-16 w-16 object-contain"
          />
        )}
      </button>

    </div>
  )
}

export default WhatsAppButton
