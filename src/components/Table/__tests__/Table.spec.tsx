import { render } from "enzyme"
import Table from "../Table"
import React from "react"

describe("render", () => {
  it("matches snapshot", () => {
    const wrapper = render(<Table />)

    expect(wrapper).toMatchSnapshot()
  })
})
