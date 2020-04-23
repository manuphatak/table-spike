import { optionsKnob, withKnobs } from "@storybook/addon-knobs"
import { prop, intersection } from "ramda"
import React, { useState, useCallback, useMemo } from "react"
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
  generateTableData,
  groupPaths,
} from "./Table"

export default {
  title: "Table",
  component: Table,
  decorators: [withKnobs],
}
type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never
type CarDatum = ArrayInfer<typeof CAR_DATA>
interface TableStateProps {
  groupDefinitions: GroupDefinition<CarDatum>[]
  rowDefinitions: RowDefinitions<CarDatum>
  data: CarDatum[]
}

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

  return (
    <TableState
      data={CAR_DATA}
      groupDefinitions={groupDefinitions}
      rowDefinitions={rowDefinitions}
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

function TableState(props: TableStateProps) {
  const [groups, allGroupPaths] = useMemo(() => {
    const _groups = generateGroups<CarDatum>(
      props.rowDefinitions,
      props.groupDefinitions,
      props.data
    )
    return [_groups, groupPaths(_groups)] as const
  }, [props.groupDefinitions, props.data, props.rowDefinitions])

  const [_collapsedGroupPaths, setCollapsedGroupPaths] = useState([
    JSON.stringify(["China"]),
    JSON.stringify(["Japan", "Ford"]),
  ])

  const collapsedGroupPaths = useMemo(
    () => intersection(allGroupPaths, _collapsedGroupPaths),
    [allGroupPaths, _collapsedGroupPaths]
  )

  const tableData = useMemo(
    () => generateTableData(allGroupPaths, collapsedGroupPaths, groups),
    [allGroupPaths, collapsedGroupPaths, groups]
  )

  const dispatch: DispatchHandler = useCallback((action) => {
    console.log("action", action)

    switch (action.type) {
      case DispatchEvent.OnCollapseRow:
        ;(() => {
          if (action.collapsed) {
            setCollapsedGroupPaths((state) => [...state, action.path])
          } else {
            setCollapsedGroupPaths((state) =>
              state.filter((path) => path !== action.path)
            )
          }
        })()
        break
      case DispatchEvent.OnCollapseAll:
        ;(() => {
          setCollapsedGroupPaths(action.collapsedGroupPaths)
        })()
    }
  }, [])

  return (
    <Table
      columnDefinitions={columnDefinitions}
      dispatch={dispatch}
      tableData={tableData}
    />
  )
}
