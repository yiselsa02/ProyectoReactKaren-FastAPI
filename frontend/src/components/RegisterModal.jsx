import { useState } from 'react'

import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'

import Input from './input'
import Select from './select'

function RegisterModal({ modoOscuro, cerrarModal }) {
  const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: '',
    numeroDocumento: '',
    direccion: '',
    telefono: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
  })

  const [errores, setErrores] = useState({})
  const [camposTocados, setCamposTocados] = useState({})
  const [cargando, setCargando] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')

  // ==============================
  // REGEX
  // ==============================

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/
  const regexNumero = /^\d+$/
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const regexDireccion =
    /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\s#.,\-°]+$/

  // ==============================
  // VALIDACIÓN DE CAMPOS
  // ==============================

  const validarCampo = (
    nombre,
    valor,
    formularioActual = formulario
  ) => {
    let mensaje = ''

    switch (nombre) {

      // ==========================
      // NOMBRE
      // MÍNIMO 3 - MÁXIMO 10
      // ==========================

      case 'nombre': {
        const nombreLimpio = valor.trim()

        if (!nombreLimpio) {
          mensaje = 'El nombre es obligatorio.'
        } else if (nombreLimpio.length < 3) {
          mensaje = 'El nombre debe tener mínimo 3 caracteres.'
        } else if (nombreLimpio.length > 10) {
          mensaje = 'El nombre no puede superar los 10 caracteres.'
        } else if (!regexNombre.test(nombreLimpio)) {
          mensaje = 'El nombre solo puede contener letras y espacios.'
        }

        break
      }

      // ==========================
      // APELLIDO
      // MÍNIMO 2 - MÁXIMO 20
      // ==========================

      case 'apellido': {
        const apellidoLimpio = valor.trim()

        if (!apellidoLimpio) {
          mensaje = 'El apellido es obligatorio.'
        } else if (apellidoLimpio.length < 2) {
          mensaje = 'El apellido debe tener mínimo 2 caracteres.'
        } else if (apellidoLimpio.length > 20) {
          mensaje = 'El apellido no puede superar los 20 caracteres.'
        } else if (!regexNombre.test(apellidoLimpio)) {
          mensaje = 'El apellido solo puede contener letras y espacios.'
        }

        break
      }

      // ==========================
      // TIPO DOCUMENTO
      // ==========================

      case 'tipoDocumento':
        if (!valor) {
          mensaje = 'Selecciona un tipo de documento.'
        }
        break

      // ==========================
      // NÚMERO DOCUMENTO
      // MÍNIMO 5 - MÁXIMO 15
      // ==========================

      case 'numeroDocumento':

        if (!valor.trim()) {
          mensaje = 'El número de documento es obligatorio.'
        } else if (!regexNumero.test(valor)) {
          mensaje = 'El documento solo puede contener números.'
        } else if (valor.length < 5) {
          mensaje = 'El documento debe tener mínimo 5 dígitos.'
        } else if (valor.length > 15) {
          mensaje = 'El documento no puede superar los 15 dígitos.'
        }

        break

      // ==========================
      // DIRECCIÓN
      // MÍNIMO 5 - MÁXIMO 50
      // ==========================

      case 'direccion': {
        const direccionLimpia = valor.trim()

        if (!direccionLimpia) {
          mensaje = 'La dirección es obligatoria.'
        } else if (direccionLimpia.length < 5) {
          mensaje = 'La dirección debe tener mínimo 5 caracteres.'
        } else if (direccionLimpia.length > 50) {
          mensaje = 'La dirección no puede superar los 50 caracteres.'
        } else if (!regexDireccion.test(direccionLimpia)) {
          mensaje = 'La dirección contiene caracteres no permitidos.'
        }

        break
      }

      // ==========================
      // TELÉFONO
      // MÍNIMO 7 - MÁXIMO 15
      // ==========================

      case 'telefono':

        if (!valor.trim()) {
          mensaje = 'El teléfono es obligatorio.'
        } else if (!regexNumero.test(valor)) {
          mensaje = 'El teléfono solo puede contener números.'
        } else if (valor.length < 7) {
          mensaje = 'El teléfono debe tener mínimo 7 dígitos.'
        } else if (valor.length > 15) {
          mensaje = 'El teléfono no puede superar los 15 dígitos.'
        }

        break

      // ==========================
      // CORREO
      // MÁXIMO 60
      // ==========================

      case 'correo':

        if (!valor.trim()) {
          mensaje = 'El correo electrónico es obligatorio.'
        } else if (valor.trim().length > 60) {
          mensaje = 'El correo no puede superar los 60 caracteres.'
        } else if (!regexCorreo.test(valor.trim())) {
          mensaje = 'Ingresa un correo electrónico válido.'
        }

        break

      // ==========================
      // CONTRASEÑA
      // MÍNIMO 6 - MÁXIMO 30
      // ==========================

      case 'contrasena':

        if (!valor) {
          mensaje = 'La contraseña es obligatoria.'
        } else if (valor.length < 6) {
          mensaje = 'La contraseña debe tener mínimo 6 caracteres.'
        } else if (valor.length > 30) {
          mensaje = 'La contraseña no puede superar los 30 caracteres.'
        } else if (!/[A-Z]/.test(valor)) {
          mensaje =
            'La contraseña debe contener al menos una letra mayúscula.'
        } else if (!/[a-z]/.test(valor)) {
          mensaje =
            'La contraseña debe contener al menos una letra minúscula.'
        } else if (!/\d/.test(valor)) {
          mensaje =
            'La contraseña debe contener al menos un número.'
        } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]';`~]/.test(valor)) {
          mensaje =
            'La contraseña debe contener al menos un carácter especial.'
        }

        break

      // ==========================
      // CONFIRMAR CONTRASEÑA
      // MÍNIMO 6 - MÁXIMO 30
      // ==========================

      case 'confirmarContrasena':

        if (!valor) {
          mensaje = 'Debes confirmar tu contraseña.'
        } else if (valor.length < 6) {
          mensaje =
            'La confirmación debe tener mínimo 6 caracteres.'
        } else if (valor.length > 30) {
          mensaje =
            'La confirmación no puede superar los 30 caracteres.'
        } else if (valor !== formularioActual.contrasena) {
          mensaje = 'Las contraseñas no coinciden.'
        }

        break

      default:
        break
    }

    return mensaje
  }

  // ==============================
  // CAMBIO DE CAMPOS
  // ==============================

  const manejarCambio = (e) => {
    const { name, value } = e.target

    const nuevoFormulario = {
      ...formulario,
      [name]: value,
    }

    setFormulario(nuevoFormulario)

    const errorCampo = validarCampo(
      name,
      value,
      nuevoFormulario
    )

    setErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: errorCampo,
    }))

    // ==============================
    // VALIDAR CONFIRMACIÓN
    // CUANDO CAMBIA LA CONTRASEÑA
    // ==============================

    if (
      name === 'contrasena' &&
      camposTocados.confirmarContrasena
    ) {
      const errorConfirmacion = validarCampo(
        'confirmarContrasena',
        nuevoFormulario.confirmarContrasena,
        nuevoFormulario
      )

      setErrores((erroresActuales) => ({
        ...erroresActuales,
        contrasena: errorCampo,
        confirmarContrasena: errorConfirmacion,
      }))
    }

    // ==============================
    // VALIDAR CONFIRMACIÓN
    // ==============================

    if (name === 'confirmarContrasena') {
      const errorConfirmacion = validarCampo(
        'confirmarContrasena',
        value,
        nuevoFormulario
      )

      setErrores((erroresActuales) => ({
        ...erroresActuales,
        confirmarContrasena: errorConfirmacion,
      }))
    }

    if (errorServidor) {
      setErrorServidor('')
    }
  }

  // ==============================
  // BLUR
  // ==============================

  const manejarBlur = (e) => {
    const { name, value } = e.target

    setCamposTocados((camposActuales) => ({
      ...camposActuales,
      [name]: true,
    }))

    const errorCampo = validarCampo(
      name,
      value,
      formulario
    )

    setErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: errorCampo,
    }))
  }

  // ==============================
  // SOLO NÚMEROS
  // MÁXIMO 15
  // ==============================

  const manejarNumero = (e) => {
    const valor = e.target.value
      .replace(/\D/g, '')
      .slice(0, 15)

    manejarCambio({
      target: {
        name: e.target.name,
        value: valor,
      },
    })
  }

  // ==============================
  // SUBMIT
  // ==============================

  const manejarSubmit = async (e) => {
    e.preventDefault()

    const nuevosErrores = {}
    const nuevosCamposTocados = {}

    Object.keys(formulario).forEach((campo) => {
      const errorCampo = validarCampo(
        campo,
        formulario[campo],
        formulario
      )

      nuevosCamposTocados[campo] = true

      if (errorCampo) {
        nuevosErrores[campo] = errorCampo
      }
    })

    setErrores(nuevosErrores)
    setCamposTocados(nuevosCamposTocados)

    // Si hay errores de validación, no se conecta al backend
    if (Object.keys(nuevosErrores).length > 0) {
      return
    }

    try {
      setCargando(true)
      setErrorServidor('')

      // ==========================================================
      // DATOS QUE SE ENVIARÁN A FASTAPI
      // ==========================================================

      const datosRegistro = {
        nombres: formulario.nombre.trim(),
        apellidos: formulario.apellido.trim(),
        tipo_documento: formulario.tipoDocumento,
        numero_documento: formulario.numeroDocumento,
        direccion: formulario.direccion.trim(),
        telefono: formulario.telefono,
        email: formulario.correo.trim(),
        password: formulario.contrasena,

        // 2 = Cliente
        rol_id: 2,
      }

      // ==========================================================
      // CONEXIÓN CON FASTAPI
      // ==========================================================

      const respuesta = await fetch(
        `${API_URL}/api/usuarios/registro`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(datosRegistro),
        }
      )

      // ==========================================================
      // LEER RESPUESTA DEL SERVIDOR
      // ==========================================================

      const datos = await respuesta.json()

      // ==========================================================
      // MANEJAR ERRORES
      // ==========================================================

      if (!respuesta.ok) {

        let mensajeError =
          'El servidor rechazó el registro.'

        // FastAPI normalmente devuelve:
        // { "detail": "mensaje" }

        if (typeof datos.detail === 'string') {
          mensajeError = datos.detail
        }

        // En caso de errores de validación de FastAPI
        else if (Array.isArray(datos.detail)) {

          mensajeError = datos.detail
            .map((error) => {
              if (typeof error === 'string') {
                return error
              }

              return error.msg || 'Error de validación.'
            })
            .join(', ')
        }

        setErrorServidor(mensajeError)

        return
      }

      // ==========================================================
      // REGISTRO EXITOSO
      // ==========================================================

      alert('Cuenta creada correctamente.')

      cerrarModal()

    } catch (error) {

      console.error('=================================')
      console.error('ERROR COMPLETO:', error)
      console.error('MENSAJE:', error.message)
      console.error('=================================')

      // ==========================================================
      // ERROR DE CONEXIÓN
      // ==========================================================

      setErrorServidor(
        'No se pudo conectar con FastAPI. Verifica que el servidor esté ejecutándose en http://127.0.0.1:8000'
      )

    } finally {

      setCargando(false)
    }
  }

  // ==============================
  // MENSAJE CORRECTO
  // ==============================

  const mostrarCorrecto = (campo) => {

    if (
      !camposTocados[campo] ||
      !formulario[campo] ||
      errores[campo]
    ) {
      return null
    }

    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-500">
        <span className="font-bold">✓</span>
        Correcto
      </p>
    )
  }

  const campoCorrecto = (campo) =>
    camposTocados[campo] &&
    formulario[campo] &&
    !errores[campo]

  const estiloSelect = campoCorrecto('tipoDocumento')
    ? 'border-emerald-600 bg-[#17263c]'
    : ''

  // ==============================
  // ESTADOS DE CONTRASEÑA
  // ==============================

  const contrasena = formulario.contrasena

  const cumpleMinimo =
    contrasena.length >= 6

  const cumpleMayuscula =
    /[A-Z]/.test(contrasena)

  const cumpleMinuscula =
    /[a-z]/.test(contrasena)

  const cumpleNumero =
    /\d/.test(contrasena)

  const cumpleEspecial =
    /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]';`~]/.test(
      contrasena
    )

  const cumpleMaximo =
    contrasena.length > 0 &&
    contrasena.length <= 30

  // ==============================
  // RENDER
  // ==============================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4"
      onClick={cerrarModal}
    >

      <div
        className={`relative max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl border shadow-2xl sm:rounded-[28px] ${
          modoOscuro
            ? 'border-slate-700/80 bg-[#0f1a2b] shadow-black/40'
            : 'border-gray-200 bg-white shadow-gray-900/20'
        }`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ==============================
            ENCABEZADO
        ============================== */}

        <div className="relative px-5 pb-6 pt-7 sm:px-8 sm:pb-7 sm:pt-8 md:px-10">

          <button
            type="button"
            onClick={cerrarModal}
            disabled={cargando}
            className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none transition-all duration-200 sm:right-5 sm:top-5 ${
              modoOscuro
                ? 'text-slate-500 hover:bg-slate-800 hover:text-white'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            }`}
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="flex flex-col items-center text-center">

            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl sm:mb-5 sm:h-20 sm:w-20 ${
                modoOscuro
                  ? 'bg-slate-800/70'
                  : 'bg-blue-50'
              }`}
            >

              <img
                src={modoOscuro ? logoDark : logo}
                alt="CellWorld"
                className="h-12 w-12 object-contain sm:h-40 sm:w-40"
              />

            </div>

            <h2
              className={`text-2xl font-bold tracking-tight sm:text-3xl ${
                modoOscuro
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              Crear una cuenta
            </h2>

            <p
              className={`mt-2 max-w-md text-xs leading-relaxed sm:text-sm ${
                modoOscuro
                  ? 'text-slate-400'
                  : 'text-gray-500'
              }`}
            >
              Regístrate para acceder a todos nuestros servicios y disfrutar de una mejor experiencia.
            </p>

          </div>

        </div>

        <div
          className={`border-t ${
            modoOscuro
              ? 'border-slate-800'
              : 'border-gray-100'
          }`}
        />

        {/* ==============================
            FORMULARIO
        ============================== */}

        <div className="px-5 py-6 sm:px-8 sm:py-8 md:px-10">

          <form onSubmit={manejarSubmit}>

            {/* ==============================
                INFORMACIÓN PERSONAL
            ============================== */}

            <div className="mb-8 sm:mb-9">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white sm:h-9 sm:w-9 sm:text-sm">
                  01
                </div>

                <div>

                  <h3
                    className={`text-sm font-bold sm:text-base ${
                      modoOscuro
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}
                  >
                    Información personal
                  </h3>

                  <p
                    className={`text-[11px] sm:text-xs ${
                      modoOscuro
                        ? 'text-slate-500'
                        : 'text-gray-400'
                    }`}
                  >
                    Datos básicos de tu cuenta
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* NOMBRE */}

                <div>

                  <Input
                    label="Nombre"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    onBlur={manejarBlur}
                    placeholder="Ej. Karen"
                    maxLength={10}
                    error={
                      camposTocados.nombre
                        ? errores.nombre
                        : ''
                    }
                    modoOscuro={modoOscuro}
                  />

                  {mostrarCorrecto('nombre')}

                </div>

                {/* APELLIDO */}

                <div>

                  <Input
                    label="Apellido"
                    name="apellido"
                    value={formulario.apellido}
                    onChange={manejarCambio}
                    onBlur={manejarBlur}
                    placeholder="Ej. Rodríguez"
                    maxLength={20}
                    error={
                      camposTocados.apellido
                        ? errores.apellido
                        : ''
                    }
                    modoOscuro={modoOscuro}
                  />

                  {mostrarCorrecto('apellido')}

                </div>

                {/* TIPO DOCUMENTO */}

                <Select
                  label="Tipo de documento"
                  name="tipoDocumento"
                  value={formulario.tipoDocumento}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  options={[
                    {
                      value: 'CC',
                      label: 'Cédula de ciudadanía'
                    },
                    {
                      value: 'CE',
                      label: 'Cédula de extranjería'
                    },
                    {
                      value: 'TI',
                      label: 'Tarjeta de identidad'
                    },
                    {
                      value: 'PAS',
                      label: 'Pasaporte'
                    },
                  ]}
                  error={
                    camposTocados.tipoDocumento
                      ? errores.tipoDocumento
                      : ''
                  }
                  modoOscuro={modoOscuro}
                  className={estiloSelect}
                />

                {/* NÚMERO DOCUMENTO */}

                <div>

                  <Input
                    label="Número de documento"
                    name="numeroDocumento"
                    value={formulario.numeroDocumento}
                    onChange={manejarNumero}
                    onBlur={manejarBlur}
                    placeholder="Ej. 1234567890"
                    maxLength={15}
                    error={
                      camposTocados.numeroDocumento
                        ? errores.numeroDocumento
                        : ''
                    }
                    modoOscuro={modoOscuro}
                  />

                  {mostrarCorrecto('numeroDocumento')}

                </div>

              </div>

            </div>

            {/* ==============================
                CONTACTO
            ============================== */}

            <div className="mb-8 sm:mb-9">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white sm:h-9 sm:w-9 sm:text-sm">
                  02
                </div>

                <div>

                  <h3
                    className={`text-sm font-bold sm:text-base ${
                      modoOscuro
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}
                  >
                    Información de contacto
                  </h3>

                  <p
                    className={`text-[11px] sm:text-xs ${
                      modoOscuro
                        ? 'text-slate-500'
                        : 'text-gray-400'
                    }`}
                  >
                    ¿Cómo podemos comunicarnos contigo?
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                {/* DIRECCIÓN */}

                <div>

                  <Input
                    label="Dirección"
                    name="direccion"
                    value={formulario.direccion}
                    onChange={manejarCambio}
                    onBlur={manejarBlur}
                    placeholder="Ej. Calle 10 #20-30"
                    maxLength={50}
                    error={
                      camposTocados.direccion
                        ? errores.direccion
                        : ''
                    }
                    modoOscuro={modoOscuro}
                  />

                  {mostrarCorrecto('direccion')}

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* TELÉFONO */}

                  <div>

                    <Input
                      label="Teléfono"
                      name="telefono"
                      type="tel"
                      value={formulario.telefono}
                      onChange={manejarNumero}
                      onBlur={manejarBlur}
                      placeholder="3001234567"
                      maxLength={15}
                      error={
                        camposTocados.telefono
                          ? errores.telefono
                          : ''
                      }
                      modoOscuro={modoOscuro}
                    />

                    {mostrarCorrecto('telefono')}

                  </div>

                  {/* CORREO */}

                  <div>

                    <Input
                      label="Correo electrónico"
                      name="correo"
                      type="email"
                      value={formulario.correo}
                      onChange={manejarCambio}
                      onBlur={manejarBlur}
                      placeholder="tu@correo.com"
                      maxLength={60}
                      error={
                        camposTocados.correo
                          ? errores.correo
                          : ''
                      }
                      modoOscuro={modoOscuro}
                    />

                    {mostrarCorrecto('correo')}

                  </div>

                </div>

              </div>

            </div>

            {/* ==============================
                SEGURIDAD
            ============================== */}

            <div className="mb-8">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white sm:h-9 sm:w-9 sm:text-sm">
                  03
                </div>

                <div>

                  <h3
                    className={`text-sm font-bold sm:text-base ${
                      modoOscuro
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}
                  >
                    Seguridad
                  </h3>

                  <p
                    className={`text-[11px] sm:text-xs ${
                      modoOscuro
                        ? 'text-slate-500'
                        : 'text-gray-400'
                    }`}
                  >
                    Protege tu cuenta con una contraseña segura
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* CONTRASEÑA */}

                <div>

                  <Input
                    label="Contraseña"
                    name="contrasena"
                    type="password"
                    value={formulario.contrasena}
                    onChange={manejarCambio}
                    onBlur={manejarBlur}
                    placeholder="Mínimo 6 caracteres"
                    maxLength={30}
                    error={
                      camposTocados.contrasena
                        ? errores.contrasena
                        : ''
                    }
                    modoOscuro={modoOscuro}
                  />

                  {mostrarCorrecto('contrasena')}

                </div>

                {/* CONFIRMAR CONTRASEÑA */}

                <div>

                  <Input
                    label="Confirmar contraseña"
                    name="confirmarContrasena"
                    type="password"
                    value={formulario.confirmarContrasena}
                    onChange={manejarCambio}
                    onBlur={manejarBlur}
                    placeholder="Repite tu contraseña"
                    maxLength={30}
                    error={
                      camposTocados.confirmarContrasena
                        ? errores.confirmarContrasena
                        : ''
                    }
                    modoOscuro={modoOscuro}
                  />

                  {mostrarCorrecto('confirmarContrasena')}

                </div>

              </div>

              {/* ==============================
                  REQUISITOS
              ============================== */}

              <div
                className={`mt-4 rounded-xl border px-4 py-4 ${
                  modoOscuro
                    ? 'border-slate-700 bg-slate-800/40'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >

                <p
                  className={`mb-2 text-xs font-bold ${
                    modoOscuro
                      ? 'text-slate-300'
                      : 'text-gray-600'
                  }`}
                >
                  Requisitos de contraseña
                </p>

                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">

                  {/* MÍNIMO 6 */}

                  <p
                    className={`text-xs ${
                      cumpleMinimo
                        ? 'text-emerald-500'
                        : modoOscuro
                          ? 'text-slate-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {cumpleMinimo ? '✓' : '○'}{' '}
                    Mínimo 6 caracteres
                  </p>

                  {/* MAYÚSCULA */}

                  <p
                    className={`text-xs ${
                      cumpleMayuscula
                        ? 'text-emerald-500'
                        : modoOscuro
                          ? 'text-slate-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {cumpleMayuscula ? '✓' : '○'}{' '}
                    Al menos una mayúscula
                  </p>

                  {/* MINÚSCULA */}

                  <p
                    className={`text-xs ${
                      cumpleMinuscula
                        ? 'text-emerald-500'
                        : modoOscuro
                          ? 'text-slate-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {cumpleMinuscula ? '✓' : '○'}{' '}
                    Al menos una minúscula
                  </p>

                  {/* NÚMERO */}

                  <p
                    className={`text-xs ${
                      cumpleNumero
                        ? 'text-emerald-500'
                        : modoOscuro
                          ? 'text-slate-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {cumpleNumero ? '✓' : '○'}{' '}
                    Al menos un número
                  </p>

                  {/* CARÁCTER ESPECIAL */}

                  <p
                    className={`text-xs ${
                      cumpleEspecial
                        ? 'text-emerald-500'
                        : modoOscuro
                          ? 'text-slate-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {cumpleEspecial ? '✓' : '○'}{' '}
                    Al menos un carácter especial
                  </p>

                  {/* MÁXIMO 30 */}

                  <p
                    className={`text-xs ${
                      cumpleMaximo
                        ? 'text-emerald-500'
                        : modoOscuro
                          ? 'text-slate-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {cumpleMaximo ? '✓' : '○'}{' '}
                    Máximo 30 caracteres
                  </p>

                </div>

              </div>

            </div>

            {/* ==============================
                ERROR DEL SERVIDOR
            ============================== */}

            {errorServidor && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-600">

                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-500 text-xs font-bold">
                  !
                </span>

                <span>{errorServidor}</span>

              </div>
            )}

            {/* ==============================
                ERROR GENERAL
            ============================== */}

            {Object.values(errores).some(Boolean) && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-600">

                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-500 text-xs font-bold">
                  !
                </span>

                <span>
                  Revisa los campos marcados antes de crear tu cuenta.
                </span>

              </div>
            )}

            {/* ==============================
                BOTONES
            ============================== */}

            <div
              className={`flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end ${
                modoOscuro
                  ? 'border-slate-800'
                  : 'border-gray-100'
              }`}
            >

              {/* CANCELAR */}

              <button
                type="button"
                onClick={cerrarModal}
                disabled={cargando}
                className={`w-full rounded-xl border px-6 py-3.5 text-sm font-semibold transition-all duration-200 sm:w-auto ${
                  modoOscuro
                    ? 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                } ${
                  cargando
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
              >
                Cancelar
              </button>

              {/* CREAR CUENTA */}

              <button
                type="submit"
                disabled={cargando}
                className={`w-full rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 sm:w-auto ${
                  cargando
                    ? 'cursor-not-allowed opacity-70'
                    : 'hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30'
                }`}
              >
                {cargando
                  ? 'Creando cuenta...'
                  : 'Crear cuenta'}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  )
}

export default RegisterModal