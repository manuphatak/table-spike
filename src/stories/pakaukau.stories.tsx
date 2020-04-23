import {
  DefaultCell,
  VirtualizedTable,
  withAutoSizing,
  withGrouping,
} from "@procore/labs-pakaukau"
import { optionsKnob, withKnobs } from "@storybook/addon-knobs"
import numeral from "numeral"
import React, { useState } from "react"
import CAR_DATA from "../fixtures/CAR_DATA"

function CurrencyCell(props: any) {
  return (
    <DefaultCell>{numeral(props.cellData).format("($0,0.00)")}</DefaultCell>
  )
}

export default {
  title: "Paukaukau",
  component: VirtualizedTable,
  decorators: [withKnobs],
}

const columnDefinitions = [
  {
    dataKey: "car_make",
    label: "Car Make",
  },
  {
    dataKey: "car_model",
    label: "Car Model",
  },
  {
    dataKey: "car_year",
    label: "Car Year",
  },
  {
    dataKey: "country",
    label: "Country",
  },
  {
    dataKey: "car_price",
    label: "Price",
    cellRenderer: CurrencyCell,
  },
  {
    dataKey: "comments",
    label: "Comments",
  },
]

const subtotalBy = ["car_price"]

const WithGrouping = withAutoSizing(withGrouping(VirtualizedTable))

type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never

type ColumnDefiniton = ArrayInfer<typeof columnDefinitions>

interface TableStateProps {
  columnDefinitions: ColumnDefiniton[]
  groupBy: ColumnDefiniton[]
  subtotalBy: string[]
}
function TableState(props: TableStateProps) {
  const [expandedGroups, setExpandedGroups] = useState(new Set<string>())

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <WithGrouping
        columnDefinitions={props.columnDefinitions as any}
        data={CAR_DATA}
        expandedGroups={expandedGroups}
        expandGroupsByDefault
        groupBy={props.groupBy as any}
        // @ts-ignore
        idField="id"
        onGroupsExpanded={setExpandedGroups}
        subtotalBy={props.subtotalBy}
      />
    </div>
  )
}
// class TableState extends React
export const PakauauWithGrouping = () => {
  const groupBy = groupDefinitionsKnob()

  return (
    <TableState
      columnDefinitions={columnDefinitions}
      groupBy={groupBy}
      subtotalBy={subtotalBy}
    />
  )
}

function groupDefinitionsKnob(): ColumnDefiniton[] {
  const valuesObj = Object.fromEntries(
    columnDefinitions.map((def) => [def.label, def.dataKey])
  )

  const groupsValues = (optionsKnob(
    "Groups",
    valuesObj,
    ["country", "car_make"],
    {
      display: "multi-select",
    }
  ) as unknown) as string[]

  return groupsValues.map((value) =>
    columnDefinitions.find((colDef) => colDef.dataKey === value)
  ) as ColumnDefiniton[]
}
