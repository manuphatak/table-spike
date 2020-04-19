import { Icon } from "@procore/core-react"
import {
  DefaultCell,
  VirtualizedTable,
  withAutoSizing,
  withGrouping,
} from "@procore/labs-pakaukau"
import { optionsKnob, withKnobs } from "@storybook/addon-knobs"
import numeral from "numeral"
import React from "react"
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

const colDefs = [
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

function sampleHeaderRowRenderer(args: any) {
  const { columns, expandedGroups, toggleExpandAll } = args
  const isExpanded = Boolean(expandedGroups.size)

  return (
    <div
      className={args.className}
      style={{
        ...args.style,
        backgroundColor: "#707070b5",
        color: "white",
      }}
    >
      <div style={{ flex: "0 0 36px" }}>
        <Icon
          style={{ marginLeft: "10px" }}
          clickable={true}
          icon={isExpanded ? "arrow-down" : "arrow-right"}
          onClick={() => {
            toggleExpandAll(expandedGroups)
          }}
          size="sm"
        />
      </div>
      {columns}
    </div>
  )
}

function sampleGroupRowRenderer(args: any) {
  const { columns, expandedGroups, toggleGroupExpand, rowData } = args
  const isExpanded = expandedGroups.has(rowData.path)
  const tier = rowData.path.match(new RegExp("::", "gi")).length

  let cols = [
    <div
      style={{
        ...args.columns[0].style,
        display: "flex",
        width: "36px",
      }}
    >
      <div
        style={{ display: "flex", marginLeft: "10px" }}
        onClick={() => {
          toggleGroupExpand(rowData.path)
        }}
      >
        {Array(tier)
          .fill(null)
          .map(() => (
            <Icon
              clickable={true}
              icon={isExpanded ? "arrow-down" : "arrow-right"}
              onClick={() => {}}
              size="sm"
            />
          ))}
      </div>
      <span style={{ marginLeft: "16px" }}>{args.rowData.title}</span>
    </div>,
    ...columns,
  ]
  return (
    <div
      className={args.className}
      role="row"
      style={{
        ...args.style,
        backgroundColor: "#eee",
      }}
    >
      {cols}
    </div>
  )
}

function sampleRowRenderer(args: any) {
  return (
    <div
      className={args.className}
      style={{
        ...args.style,
      }}
    >
      <div style={{ width: "36px" }} />
      {args.columns}
    </div>
  )
}

const customRenderers = {
  headerRowRenderer: sampleHeaderRowRenderer,
  groupRowRenderer: sampleGroupRowRenderer,
  bodyRowRenderer: sampleRowRenderer,
}

class Container extends React.Component<any, any> {
  // @ts-ignore
  constructor(props) {
    super(props)
    this.state = {
      expandedGroups: new Set(),
    }
    this.onGroupsExpanded = this.onGroupsExpanded.bind(this)
    this.onChangeGroupBy = this.onChangeGroupBy.bind(this)

    this.nonGroupedByColDefs = this.nonGroupedByColDefs.bind(this)
    this.onToggle = this.onToggle.bind(this)
  }

  onGroupsExpanded(expandedGroups: any) {
    this.setState({ expandedGroups })
  }

  onChangeGroupBy(e: any) {
    // console.log("Selected", e.target.value)
    if (e.target.value) {
      const colDefsToAdd = this.props.colDefs.filter(
        (colDef: any) => colDef.dataKey === e.target.value
      )
      this.setState({ groupBy: [...this.state.groupBy, ...colDefsToAdd] })
    }
  }

  onToggle() {
    this.setState({ useCustomRenderers: !this.state.useCustomRenderers })
  }

  nonGroupedByColDefs() {
    return this.props.colDefs.filter(
      (colDef: any) => !this.state.groupBy.includes(colDef)
    )
  }

  render() {
    const renderers = this.state.useCustomRenderers ? customRenderers : {}
    const { colDefs, subtotalBy } = this.props

    return (
      <div style={{ width: "100%", height: "100%" }}>
        <WithGrouping
          columnDefinitions={colDefs}
          data={CAR_DATA}
          groupBy={this.props.groupBy}
          subtotalBy={subtotalBy}
          expandedGroups={this.state.expandedGroups}
          onGroupsExpanded={this.onGroupsExpanded}
          expandGroupsByDefault={true}
          // @ts-ignore
          idField="id"
          {...renderers}
        />
      </div>
    )
  }
}
export const PakauauWithGrouping = () => {
  const valuesObj = Object.fromEntries(
    colDefs.map((def) => [def.label, def.dataKey])
  )
  const groupsValues = (optionsKnob(
    "Groups",
    valuesObj,
    ["country", "car_make"],
    {
      display: "multi-select",
    }
  ) as unknown) as string[]

  const groupBy = groupsValues.map((value) =>
    colDefs.find((colDef) => colDef.dataKey === value)
  )

  return (
    <Container colDefs={colDefs} subtotalBy={subtotalBy} groupBy={groupBy} />
  )
}
