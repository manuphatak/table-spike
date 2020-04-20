import { optionsKnob, withKnobs } from "@storybook/addon-knobs"
import { prop } from "ramda"
import React, { useState } from "react"
import CAR_DATA from "../../fixtures/CAR_DATA"
import Table from "./"
import {
  ColumnDefinition,
  GroupDefinition,
  RowDefinitions,
  RowType,
  generateGroups,
  DispatchHandler,
  DispatchEvent,
} from "./Table"

export default {
  title: "Table",
  component: Table,
  decorators: [withKnobs],
}
type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never
type CarDatum = ArrayInfer<typeof CAR_DATA>

const columnDefinitions: ColumnDefinition<CarDatum>[] = [
  { dataKey: "car_make", label: "Car Make", flex: "1 0 100px" },
  { dataKey: "car_model", label: "Car Model", flex: "1 0 100px" },
  { dataKey: "car_year", label: "Car Year", flex: "0.5 0 50px" },
  { dataKey: "country", label: "Country", flex: "1 0 100px" },
  { dataKey: "car_price", label: "Price", flex: "1 0 100px" },
  { dataKey: "comments", label: "Comments", flex: "2 0 200px" },
]

const rowDefinitions: RowDefinitions<CarDatum> = {
  [RowType.Body]: {
    height: 48,
    keyFn: prop("id"),
  },
}

export const Basic = () => {
  const groupDefinitions = groupDefinitionsKnob()
  const groups = generateGroups<CarDatum>(
    rowDefinitions,
    groupDefinitions,
    CAR_DATA
  )

  const [collapsedGroupPaths, setCollapsedGroupPaths] = useState([
    JSON.stringify(["China"]),
    JSON.stringify(["Japan", "Ford"]),
  ])

  const dispatch: DispatchHandler = (action) => {
    switch (action.type) {
      case DispatchEvent.OnCollapse:
        ;(() => {
          if (action.collapsed) {
            setCollapsedGroupPaths([...collapsedGroupPaths, action.path])
          } else {
            setCollapsedGroupPaths(
              collapsedGroupPaths.filter((path) => path !== action.path)
            )
          }
        })()
    }
  }
  return (
    <Table
      data={CAR_DATA}
      groups={groups}
      columnDefinitions={columnDefinitions}
      collapsedGroupPaths={collapsedGroupPaths}
      dispatch={dispatch}
    />
  )
}

function groupDefinitionsKnob(): GroupDefinition<CarDatum>[] {
  const options = Object.fromEntries(
    columnDefinitions.map(({ label, dataKey }) => [label, dataKey])
  )

  const groupValues = (optionsKnob("Groups", options, ["country", "car_make"], {
    display: "multi-select",
  }) as unknown) as (keyof CarDatum)[] | null

  if (!groupValues) {
    return []
  }
  return groupValues.map((value) => (data) => prop(value, data).toString())
}
