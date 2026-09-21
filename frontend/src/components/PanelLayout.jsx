function PanelLayout({ children, modoOscuro }) {
  return (
    <div
      className={
        modoOscuro
          ? 'min-h-screen bg-[#08111f]'
          : 'min-h-screen bg-slate-50'
      }
    >
      {children}
    </div>
  )
}

export default PanelLayout