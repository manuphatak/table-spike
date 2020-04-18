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

type RowData<T = CarDatum> = HeaderRowData | BodyRowData<T> | GroupRowData
type CommonRowData = { type: RowType; height: number; key: Key }
type HeaderRowData = CommonRowData & { type: RowType.Header }
type GroupRowData = CommonRowData & { type: RowType.GroupHeader; label: string }
type BodyRowData<T> = CommonRowData & {
  type: RowType.Body
} & T

type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never

type CarDatum = ArrayInfer<typeof carData>

interface Group<T = CarDatum> {
  groupKey: keyof (T & CommonRowData)
  groupData: Array<(T & CommonRowData) | Group<T>>
}

interface ColumnDefinition<T = CarDatum> {
  label: string
  dataKey: keyof T
  flex: CSSProperties["flex"]
}

interface RowSwitchProps {
  index: number
  style: CSSProperties
}

interface RowProps<T extends RowData> {
  index: number
  style: CSSProperties
  rowData: T
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

const StyledCell = styled.div<{ flex: CSSProperties["flex"] }>`
  flex: ${(props) => props.flex};
  white-space: nowrap;
  overflow: hidden;
`

const groupKeys: Array<keyof (CarDatum & CommonRowData)> = ["car_make"]

function addCommonRowData<T extends CarDatum = CarDatum>(
  data: T[]
): Array<T & CommonRowData> {
  return data.map((datum) => ({
    type: RowType.Body,
    ...datum,
    height: 48,
    key: datum.id,
  }))
}

function createGroups<T extends CarDatum = CarDatum>(
  data: Array<T & CommonRowData>
): Group[] {
  return compose(
    map(([groupKey, groupData]) => ({
      groupKey: groupKey,
      groupData: groupData,
    })),
    toPairs,
    groupBy(prop("car_make"))
  )(data)
}

function flattenGroups<T extends CarDatum = CarDatum>(
  groups: Group<T>[]
): RowData<T>[] {
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

const renderData: RowData<CarDatum>[] = [
  { type: RowType.Header, height: 48, key: "header" },
  ...flattenGroups(createGroups(addCommonRowData(carData))),
]

const columnDefinitions: ColumnDefinition[] = [
  { dataKey: "car_make", label: "Car Make", flex: "1 0 100px" },
  { dataKey: "car_model", label: "Car Model", flex: "1 0 100px" },
  { dataKey: "car_year", label: "Car Year", flex: "0.5 0 50px" },
  { dataKey: "country", label: "Country", flex: "1 0 100px" },
  { dataKey: "car_price", label: "Price", flex: "1 0 100px" },
  { dataKey: "comments", label: "Comments", flex: "2 0 200px" },
]

function HeaderRow(props: RowProps<HeaderRowData>) {
  return (
    <StyledRow
      style={props.style}
      key={props.rowData.key}
      className={cx("table__head")}
    >
      {columnDefinitions.map((columnDefinition) => (
        <StyledCell
          className={cx("table__th")}
          key={columnDefinition.dataKey}
          flex={columnDefinition.flex}
        >
          <label className={cx("table__th__label")}>
            {columnDefinition.label}
          </label>
        </StyledCell>
      ))}
    </StyledRow>
  )
}
function GroupHeaderRow(props: RowProps<GroupRowData>) {
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

const BodyRow = function BodyRow<T extends CarDatum = CarDatum>(
  props: RowProps<BodyRowData<T>>
) {
  return (
    <StyledRow style={props.style} className={cx("table__body-row")}>
      {columnDefinitions.map((columnDefinition) => (
        <StyledCell
          className={cx("table__td")}
          key={columnDefinition.dataKey}
          flex={columnDefinition.flex}
        >
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
