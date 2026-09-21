function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  error = '',
  modoOscuro = false,
  maxLength,
}) {
  const estiloInput = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    : modoOscuro
      ? 'border-slate-600 bg-[#17263c] text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20'

  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className={`mb-2 block text-sm font-semibold ${modoOscuro ? 'text-slate-200' : 'text-gray-700'}`}
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-xl border px-4 py-3 outline-none transition-all duration-200 ${estiloInput}`}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input