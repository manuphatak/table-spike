import { render } from "enzyme"
import Table from "../Table"
import React from "react"

describe("render", () => {
  it("matches snapshot", () => {
    const wrapper = render(
      <Table
        initialDimensions={{
          height: 400,
          width: 1600,
        }}
      />
    )

    expect(wrapper).toMatchSnapshot()
  })
})
