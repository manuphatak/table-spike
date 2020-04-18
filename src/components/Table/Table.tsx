import classnames from "classnames/bind"
import React, { CSSProperties, Key, memo, ReactElement } from "react"
import { areEqual, VariableSizeList, ListItemKeySelector } from "react-window"
import styled from "styled-components/macro"
import AutoSizer, { Dimensions } from "./AutoSizer"
import carData from "./carData"
import styles from "./Table.module.scss"
import { compose, map, toPairs, groupBy, prop, flatten } from "ramda"

interface TableProps {
  initialDimensions?: Dimensions
}

enum RowType {
  Header,
  GroupHeader,
  Body,
}

type RowData = HeaderRowData | BodyRowData | GroupRowData
type CommonRowData = { type: RowType; height: number; key: Key }
type HeaderRowData = CommonRowData & { type: RowType.Header }
type GroupRowData = CommonRowData & { type: RowType.GroupHeader }
type BodyRowData = CommonRowData & { type: RowType.Body } & ArrayInfer<
    typeof carData
  >
type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never

type CarDatum = ArrayInfer<typeof carData>

interface ColumnDefinition {
  label: string
  dataKey: keyof CarDatum
}
interface HeaderRowProps {
  index: number
  style: CSSProperties
  rowData: HeaderRowData
}
interface GroupHeaderRowProps {
  index: number
  style: CSSProperties
  rowData: GroupRowData
}
interface BodyRowProps {
  index: number
  style: CSSProperties
  rowData: BodyRowData
}
interface RowSwitchProps {
  index: number
  style: CSSProperties
}

const cx = classnames.bind(styles)

const StyledList = styled(VariableSizeList)`
  box-sizing: border-box;

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }
`

const StyledRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0;
  padding: 0;
  align-items: center;
`

const StyledCell = styled.div`
  flex: 1 0 100px;
  white-space: nowrap;
  overflow: hidden;
`

const groupKeys: Array<keyof (CarDatum & CommonRowData)> = ["car_make"]

interface Group {
  groupKey: keyof (CarDatum & CommonRowData)
  groupData: Array<(CarDatum & CommonRowData) | Group>
}

function addCommonRowData(data: CarDatum[]): Array<CarDatum & CommonRowData> {
  return data.map((datum) => ({
    type: RowType.Body,
    ...datum,
    height: 48,
    key: datum.id,
  }))
}

function createGroups(data: Array<CarDatum & CommonRowData>): Group[] {
  return compose(
    map(([groupKey, groupData]) => ({
      groupKey: groupKey,
      groupData: groupData,
    })),
    toPairs,
    groupBy(prop("car_make"))
  )(data)
}

function flattenGroups(groups: Group[]): RowData[] {
  return flatten(
    groups.map((group) => {
      return [
        {
          type: RowType.GroupHeader,
          height: 48,
          key: group.groupKey,
          label: group.groupKey,
        },
        ...group.groupData,
      ]
    })
  )
}

const renderData: RowData[] = [
  { type: RowType.Header, height: 48, key: "header" },
  ...flattenGroups(createGroups(addCommonRowData(carData))),
]

const columnDefinitions: ColumnDefinition[] = [
  { dataKey: "car_make", label: "Car Make" },
  { dataKey: "car_model", label: "Car Model" },
  { dataKey: "car_year", label: "Car Year" },
  { dataKey: "country", label: "Country" },
  { dataKey: "car_price", label: "Price" },
  { dataKey: "comments", label: "Comments" },
]

function HeaderRow(props: HeaderRowProps) {
  return (
    <StyledRow
      style={props.style}
      key={props.rowData.key}
      className={cx("table__head")}
    >
      {columnDefinitions.map((columnDefinition) => (
        <StyledCell className={cx("table__th")} key={columnDefinition.dataKey}>
          <label className={cx("table__th__label")}>
            {columnDefinition.label}
          </label>
        </StyledCell>
      ))}
    </StyledRow>
  )
}
function GroupHeaderRow(props: GroupHeaderRowProps) {
  return (
    <StyledRow
      style={props.style}
      key={props.rowData.key}
      className={cx("table__group-row", "table__group-row__content")}
    >
      <div className={cx("table__group-row__title")}>{props.rowData.label}</div>
    </StyledRow>
  )
}

const BodyRow = function BodyRow(props: BodyRowProps) {
  return (
    <StyledRow style={props.style} className={cx("table__body-row")}>
      {columnDefinitions.map((columnDefinition) => (
        <StyledCell className={cx("table__td")} key={columnDefinition.dataKey}>
          <label className={cx("table__text-cell")}>
            {props.rowData[columnDefinition.dataKey]}
          </label>
        </StyledCell>
      ))}
    </StyledRow>
  )
}

const RowSwitch = memo(function RowSwitch(props: RowSwitchProps): JSX.Element {
  const rowData = renderData[props.index]

  switch (rowData.type) {
    case RowType.Header:
      return (
        <HeaderRow index={props.index} style={props.style} rowData={rowData} />
      )
    case RowType.GroupHeader:
      return (
        <GroupHeaderRow
          index={props.index}
          style={props.style}
          rowData={rowData}
        />
      )

    case RowType.Body:
      return (
        <BodyRow index={props.index} style={props.style} rowData={rowData} />
      )
  }
}, areEqual)

const getItemSize = (index: number): number => renderData[index].height
const getItemKey: ListItemKeySelector = (index) => renderData[index].key

export default function Table(props: TableProps): ReactElement {
  return (
    <AutoSizer initialDimensions={props.initialDimensions}>
      {({ dimensions }) => {
        return (
          <StyledList
            height={dimensions.height}
            itemCount={renderData.length}
            itemSize={getItemSize}
            width={dimensions.width}
            className={cx("table__table")}
            itemKey={getItemKey}
          >
            {RowSwitch}
          </StyledList>
        )
      }}
    </AutoSizer>
  )
}
