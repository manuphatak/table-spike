import React, { ReactElement, ReactNode } from "react"
import "./storybook.css"

interface Props {
  children: ReactNode
}

export default function Storybook({ children }: Props): ReactElement {
  return <>{children}</>
}
