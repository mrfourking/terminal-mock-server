import type { FC, ReactNode } from "react"

interface IButtonProps {
  onClick?: () => void
  children?: ReactNode
}

const Button: FC<IButtonProps> = ({ onClick, children }) => {
  return (
    <button
      className=" bg-indigo-400 dark:bg-indigo-700 px-12 py-2 rounded-lg text-white"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
