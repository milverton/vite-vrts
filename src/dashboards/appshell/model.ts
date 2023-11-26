import React from "react";

export interface IMenu {
  name: string
  href: string
  icon: any
  current: boolean
  description: string
}

export interface AppShellProps {
  children: React.ReactChild
}