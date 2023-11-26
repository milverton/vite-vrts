import React from "react";

export interface MenuProps {
  menuName: string // value field on enum
  menuType: any // key field on enum
  uid?: string // string field to associate selection with other data
  selection?: string // will be the menuName the user chooses
}

export interface StringSelectProps {
  name: string
  className: string | undefined
  menu: MenuProps[]
  selected: MenuProps
  setSelected: (value: MenuProps) => void
  style?: React.CSSProperties
}