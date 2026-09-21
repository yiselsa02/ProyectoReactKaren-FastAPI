import { useState } from 'react'
import { Plus } from 'lucide-react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

const initial = {
  nombre: '',
  categoria: 'Celulares',
  descripcion: '',
  almacenamiento: '',
  ram: '',
  color: '',
  precio: '',
  stock: '',
  imagen: ''
}

function obtenerMensajeError(data) {
  if (!data) return 'No se pudo crear el producto.'
  if (typeof data === 'string') return data

  if (Array.isArray(data)) {
    return data
      .map((item) => obtenerMensajeError(item))
      .filter(Boolean)
      .join(', ')
  }

  if (typeof data === 'object') {
    if (Array.isArray(data.loc) && data.msg) {
      return `${data.loc[data.loc.length - 1]}: ${data.msg}`
    }

    if (data.detail) return obtenerMensajeError(data.detail)
    if (data.message) return obtenerMensajeError(data.message)
    if (data.error) return obtenerMensajeError(data.error)
    if (data.msg) return obtenerMensajeError(data.msg)
  }

  return 'No se pudo crear el producto.'
}

function EmployeeProductForm({ modoOscuro, onCreated }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/productos',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...form,
            precio: Number(form.precio),
            stock: Number(form.stock)
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data))
      }

      setForm(initial)
      setMessage('Producto agregado correctamente.')

      onCreated?.()

    } catch (error) {
      setMessage(
        typeof error?.message === 'string'
          ? error.message
          : 'No se pudo crear el producto.'
      )

    } finally {
      setSaving(false)
    }
  }

  const input = `
    w-full
    rounded-lg
    border
    px-3
    py-2
    text-sm
    outline-none
    focus:border-blue-500
    ${
      modoOscuro
        ? 'border-slate-600 bg-[#17263c] text-white placeholder-slate-400'
        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
    }
  `

  return (
    <section
      className={`
        mt-8
        rounded-3xl
        border
        p-6
        shadow-xl
        ${
          modoOscuro
            ? 'border-slate-700 bg-[#121d2e]'
            : 'border-gray-200 bg-white'
        }
      `}
    >

      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div className="mb-5 flex items-center gap-3">

        <div className="rounded-xl bg-blue-500/10 p-2">
          <Plus
            className="text-blue-600"
            size={22}
          />
        </div>

        <div>

          <h2
            className={`
              text-xl
              font-bold
              ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }
            `}
          >
            Agregar producto
          </h2>

          <p
            className={`
              text-sm
              ${
                modoOscuro
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }
            `}
          >
            El empleado puede registrar nuevos celulares.
          </p>

        </div>

      </div>

      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <form
        onSubmit={submit}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >

        {/* ===================================================
            NOMBRE
        =================================================== */}

        <input
          required
          className={input}
          placeholder="Nombre del producto"
          value={form.nombre}
          onChange={(e) =>
            setForm({
              ...form,
              nombre: e.target.value
            })
          }
        />

        {/* ===================================================
            CATEGORÍA
        =================================================== */}

        <input
          required
          className={input}
          placeholder="Categoría"
          value={form.categoria}
          onChange={(e) =>
            setForm({
              ...form,
              categoria: e.target.value
            })
          }
        />

        {/* ===================================================
            ALMACENAMIENTO
        =================================================== */}

        <input
          required
          className={input}
          placeholder="Almacenamiento (ej: 128GB)"
          value={form.almacenamiento}
          onChange={(e) =>
            setForm({
              ...form,
              almacenamiento: e.target.value
            })
          }
        />

        {/* ===================================================
            RAM
        =================================================== */}

        <input
          required
          className={input}
          placeholder="RAM (ej: 8GB)"
          value={form.ram}
          onChange={(e) =>
            setForm({
              ...form,
              ram: e.target.value
            })
          }
        />

        {/* ===================================================
            COLOR
        =================================================== */}

        <input
          required
          className={input}
          placeholder="Color"
          value={form.color}
          onChange={(e) =>
            setForm({
              ...form,
              color: e.target.value
            })
          }
        />

        {/* ===================================================
            PRECIO
        =================================================== */}

        <input
          required
          type="number"
          min="0"
          step="0.01"
          className={input}
          placeholder="Precio"
          value={form.precio}
          onChange={(e) =>
            setForm({
              ...form,
              precio: e.target.value
            })
          }
        />

        {/* ===================================================
            STOCK
        =================================================== */}

        <input
          required
          type="number"
          min="0"
          className={input}
          placeholder="Stock"
          value={form.stock}
          onChange={(e) =>
            setForm({
              ...form,
              stock: e.target.value
            })
          }
        />

        {/* ===================================================
            URL IMAGEN
        =================================================== */}

        <input
          className={input}
          placeholder="URL de imagen"
          value={form.imagen}
          onChange={(e) =>
            setForm({
              ...form,
              imagen: e.target.value
            })
          }
        />

        {/* ===================================================
            DESCRIPCIÓN
        =================================================== */}

        <textarea
          required
          rows="3"
          className={`
            ${input}
            resize-none
            sm:col-span-2
            lg:col-span-3
          `}
          placeholder="Descripción del producto"
          value={form.descripcion}
          onChange={(e) =>
            setForm({
              ...form,
              descripcion: e.target.value
            })
          }
        />

        {/* ===================================================
            BOTÓN
        =================================================== */}

        <div className="sm:col-span-2 lg:col-span-3">

          <button
            type="submit"
            disabled={saving}
            className="
              rounded-lg
              bg-blue-600
              px-5
              py-2.5
              text-sm
              font-bold
              text-white
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving
              ? 'Guardando...'
              : 'Agregar producto'}
          </button>

          {message && (
            <span
              className={`
                ml-3
                text-sm
                ${
                  message.includes('correctamente')
                    ? 'text-emerald-500'
                    : 'text-red-500'
                }
              `}
            >
              {message}
            </span>
          )}

        </div>

      </form>

    </section>
  )
}

export default EmployeeProductForm