export const Logo = ({className}: {className: string}) => {
  return (
      <div className={className}>
        <img
          className="h-20 w-auto"
          src="/images/logo.png"
          alt="Logo"
        />
      </div>
  )
}