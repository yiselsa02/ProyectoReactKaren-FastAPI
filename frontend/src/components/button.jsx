import { Link } from 'react-router-dom'

function Button({
  children,
  type = 'button',
  onClick,
  disabled = false,
  variante = 'primary',
  to,
}) {
  const estilos = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  }

  const claseBase = `inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:w-auto sm:px-5 sm:text-base ${estilos[variante]}`

  if (to) {
    return (
      <Link
        to={to}
        className={claseBase}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${claseBase} ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {children}
    </button>
  )
}

export default Button