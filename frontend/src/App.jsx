import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Chatbot from './components/Chatbot'
import PanelLayout from './components/PanelLayout'
import RecoverPassword from './components/RecoverPassword'
import { CartProvider } from './context/CartContext'

import Index from './pages/Index'
import Productos from './pages/Productos'
import QuienesSomos from './pages/QuienesSomos'
import Contacto from './pages/contacto'
import Login from './pages/Login'
import PanelAdmin from './pages/PanelAdmin'
import PanelCliente from './pages/PanelCliente'
import PanelEmpleado from './pages/PanelEmpleado'

function App() {
  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })
  const location = useLocation()
  const esPanel = ['/admin', '/empleado', '/cliente'].includes(location.pathname)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', modoOscuro)
    localStorage.setItem('theme', modoOscuro ? 'dark' : 'light')
  }, [modoOscuro])

  const cambiarModoOscuro = () => {
    setModoOscuro((estadoActual) => !estadoActual)
  }

  return (
    <CartProvider>
      <div
        className={`min-h-screen transition-colors duration-500 ${
          modoOscuro ? 'bg-[#0b1422]' : 'bg-slate-50'
        }`}
      >
        {!esPanel && (
          <Header
            modoOscuro={modoOscuro}
            cambiarModoOscuro={cambiarModoOscuro}
          />
        )}

        {esPanel ? (
          <PanelLayout modoOscuro={modoOscuro}>
            <main>
              <Routes>
                <Route
                  path="/admin"
                  element={<PanelAdmin modoOscuro={modoOscuro} />}
                />
                <Route
                  path="/empleado"
                  element={<PanelEmpleado modoOscuro={modoOscuro} />}
                />
                <Route
                  path="/cliente"
                  element={<PanelCliente modoOscuro={modoOscuro} />}
                />
              </Routes>
            </main>
          </PanelLayout>
        ) : (
          <main>
            <Routes>
              <Route path="/" element={<Index modoOscuro={modoOscuro} />} />
              <Route
                path="/productos"
                element={<Productos modoOscuro={modoOscuro} />}
              />
              <Route
                path="/quienes-somos"
                element={<QuienesSomos modoOscuro={modoOscuro} />}
              />
              <Route
                path="/contacto"
                element={<Contacto modoOscuro={modoOscuro} />}
              />
              <Route
                path="/login"
                element={<Login modoOscuro={modoOscuro} />}
              />
              <Route
                path="/recuperar-contrasena"
                element={<RecoverPassword modoOscuro={modoOscuro} />}
              />
            </Routes>
          </main>
        )}

        {!esPanel && <Footer modoOscuro={modoOscuro} />}
        {!esPanel && <WhatsAppButton />}
        {!esPanel && <Chatbot modoOscuro={modoOscuro} />}
      </div>
    </CartProvider>
  )
}

export default App
