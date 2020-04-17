import React from "react"
import { addDecorator } from "@storybook/react"
import Storybook from "../src/Storybook"

addDecorator((storyFn) => <Storybook>{storyFn()}</Storybook>)
