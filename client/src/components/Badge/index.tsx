import { type FC, useMemo } from "react"

export enum BadgeTypeEnum {
  success = "success",
  warning = "warning",
  danger = "danger",
}

interface IBadgeProps {
  type?: BadgeTypeEnum
  text: string
}

export const Badge: FC<IBadgeProps> = ({ text, type = BadgeTypeEnum.warning }) => {
  const typeClasses = useMemo(() => {
    switch (type) {
      case BadgeTypeEnum.success:
        return "bg-green-300 text-green-900"
      case BadgeTypeEnum.danger:
        return "bg-red-300 text-orange-950"
      case BadgeTypeEnum.warning:
      default:
        return "bg-yellow-300 text-yellow-900"
    }
  }, [type])

  return (
    <span className={` text-xs font-medium px-1.5 py-0.5 rounded-2xl ${typeClasses}`}>{text}</span>
  )
}
