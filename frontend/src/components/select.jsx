function Select({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error = '',
  modoOscuro = false,
}) {
  const claseLabel = `mb-2 block text-sm font-semibold ${
    modoOscuro ? 'text-slate-200' : 'text-gray-700'
  }`

  const claseSelect = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 ${
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
      : modoOscuro
        ? 'border-slate-600 bg-[#17263c] text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  }`

  return (
    <div className="w-full min-w-0">
      <label
        htmlFor={name}
        className={claseLabel}
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={claseSelect}
      >
        <option
          value=""
          className={
            modoOscuro
              ? 'bg-[#17263c] text-white'
              : 'bg-white text-gray-900'
          }
        >
          Selecciona una opción
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className={
              modoOscuro
                ? 'bg-[#17263c] text-white'
                : 'bg-white text-gray-900'
            }
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

export default Select