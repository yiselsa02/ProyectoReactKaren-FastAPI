import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import PanelLayout from './components/PanelLayout'
import { CartProvider } from './context/CartContext'

import Index from './pages/Index'
import Productos from './pages/Productos'
import QuienesSomos from './pages/QuienesSomos'
import Contacto from './pages/Contacto'
import Login from './pages/Login'

import PanelAdmin from './pages/PanelAdmin'
import PanelCliente from './pages/PanelCliente'
import PanelEmpleado from './pages/PanelEmpleado'

import RecoverPassword from './components/RecoverPassword'
import Chatbot from './components/Chatbot'

function App() {

  // =====================================================
  // MODO OSCURO GLOBAL
  // =====================================================

  const [modoOscuro, setModoOscuro] = useState(() => {

    const temaGuardado =
      localStorage.getItem('theme')

    if (temaGuardado === 'dark') {
      return true
    }

    if (temaGuardado === 'light') {
      return false
    }

    return false
  })

  // =====================================================
  // CAMBIAR MODO OSCURO
  // =====================================================

  const cambiarModoOscuro = () => {

    setModoOscuro(
      (estadoActual) => !estadoActual
    )
  }

  // =====================================================
  // APLICAR MODO OSCURO GLOBALMENTE
  // =====================================================

  useEffect(() => {

    const html =
      document.documentElement

    if (modoOscuro) {

      html.classList.add('dark')

      localStorage.setItem(
        'theme',
        'dark'
      )

    } else {

      html.classList.remove('dark')

      localStorage.setItem(
        'theme',
        'light'
      )
    }

  }, [modoOscuro])

  // =====================================================
  // UBICACIÓN ACTUAL
  // =====================================================

  const location = useLocation()

  // =====================================================
  // SABER SI ESTÁ EN UN PANEL
  // =====================================================

  const esPanel = [
    '/admin',
    '/empleado',
    '/cliente'
  ].includes(location.pathname)

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <CartProvider>

      <div
        className={`min-h-screen transition-colors duration-500 ${
          modoOscuro
            ? 'bg-[#0b1422]'
            : 'bg-slate-50'
        }`}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        {!esPanel && (

          <Header
            modoOscuro={modoOscuro}
            cambiarModoOscuro={
              cambiarModoOscuro
            }
          />

        )}

        {/* =====================================================
            CONTENIDO
        ===================================================== */}

        {esPanel ? (

          <PanelLayout
            modoOscuro={modoOscuro}
          >

            <main>

              <Routes>

                <Route
                  path="/admin"
                  element={
                    <PanelAdmin
                      modoOscuro={
                        modoOscuro
                      }
                    />
                  }
                />

                <Route
                  path="/empleado"
                  element={
                    <PanelEmpleado
                      modoOscuro={
                        modoOscuro
                      }
                    />
                  }
                />

                <Route
                  path="/cliente"
                  element={
                    <PanelCliente
                      modoOscuro={
                        modoOscuro
                      }
                    />
                  }
                />

              </Routes>

            </main>

          </PanelLayout>

        ) : (

          <main>

            <Routes>

              {/* INICIO */}

              <Route
                path="/"
                element={
                  <Index
                    modoOscuro={
                      modoOscuro
                    }
                  />
                }
              />

              {/* PRODUCTOS */}

              <Route
                path="/productos"
                element={
                  <Productos
                    modoOscuro={
                      modoOscuro
                    }
                  />
                }
              />

              {/* QUIÉNES SOMOS */}

              <Route
                path="/quienes-somos"
                element={
                  <QuienesSomos
                    modoOscuro={
                      modoOscuro
                    }
                  />
                }
              />

              {/* CONTACTO */}

              <Route
                path="/contacto"
                element={
                  <Contacto
                    modoOscuro={
                      modoOscuro
                    }
                  />
                }
              />

              {/* LOGIN */}

              <Route
                path="/login"
                element={
                  <Login
                    modoOscuro={
                      modoOscuro
                    }
                  />
                }
              />

              {/* RECUPERAR CONTRASEÑA */}

              <Route
                path="/recuperar-contrasena"
                element={
                  <RecoverPassword
                    modoOscuro={
                      modoOscuro
                    }
                  />
                }
              />

            </Routes>

          </main>

        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        {!esPanel && (

          <Footer
            modoOscuro={
              modoOscuro
            }
          />

        )}

        {/* =====================================================
            WHATSAPP
        ===================================================== */}

        {!esPanel && (
          <WhatsAppButton />
        )}

        {!esPanel && (
          <Chatbot modoOscuro={modoOscuro} />
        )}

      </div>

    </CartProvider>
  )
}

export default App