import type { FC, ReactNode } from "react"

interface IButtonProps {
  onClick?: () => void
  children?: ReactNode
  className?: string
  disabled?: boolean
}

const Button: FC<IButtonProps> = ({ onClick, children, className = "", disabled }) => {
  return (
    <button
      className={`${className} bg-indigo-400 dark:bg-indigo-700 px-12 py-2 rounded-lg text-white break-all`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
