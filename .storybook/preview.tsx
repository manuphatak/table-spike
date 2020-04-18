import { addDecorator } from "@storybook/react"

import React, { ReactElement, ReactNode } from "react"
import { createGlobalStyle } from "styled-components/macro"

const GloblaStyles = createGlobalStyle`
  html,
  body,
  #root {
    height: 100%;
    width: 100%;
    margin: 0;
  }
`
interface StorybookProps {
  children: ReactNode
}

export default function Storybook({ children }: StorybookProps): ReactElement {
  return (
    <>
      <GloblaStyles />
      {children}
    </>
  )
}

addDecorator((storyFn) => <Storybook>{storyFn()}</Storybook>)
