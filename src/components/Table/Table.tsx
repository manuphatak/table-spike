import classnames from "classnames/bind"
import { groupBy, map, pipe, prop, toPairs, unnest } from "ramda"
import React, { CSSProperties, Key, memo, ReactElement } from "react"
import { areEqual, ListItemKeySelector, VariableSizeList } from "react-window"
import styled from "styled-components/macro"
import AutoSizer, { Dimensions } from "./AutoSizer"
import carData from "./carData"
import styles from "./Table.module.scss"

interface TableProps {
  initialDimensions?: Dimensions
}

export enum RowType {
  Header,
  GroupHeader,
  Body,
}

type CommonRowData = { type: RowType; height: number; key: Key }
type RowDatum<T extends CarDatum = CarDatum> =
  | HeaderRowDatum
  | BodyRowDatum<T>
  | GroupRowDatum
type HeaderRowDatum = CommonRowData & { type: RowType.Header }
type GroupRowDatum = CommonRowData & {
  type: RowType.GroupHeader
  label: string
  depth: number
}
type BodyRowDatum<T extends CarDatum> = CommonRowData &
  T & {
    type: RowType.Body
  }

type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never
type CarDatum = ArrayInfer<typeof carData>
type Group<T extends CarDatum> = {
  path: string[]
  value: Key
  children: BodyRowOrGroup<T>[]
}

type BodyRowOrGroup<T extends CarDatum = CarDatum> = BodyRowDatum<T> | Group<T>

interface ColumnDefinition<T = CarDatum> {
  label: string
  dataKey: keyof T
  flex: CSSProperties["flex"]
}

interface RowSwitchProps {
  index: number
  style: CSSProperties
}

interface RowProps<T extends RowDatum> {
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

export function addCommonRowData<T extends CarDatum = CarDatum>(
  data: T[]
): BodyRowDatum<T>[] {
  return data.map((datum) => ({
    type: RowType.Body,
    ...datum,
    height: 48,
    key: datum.id,
  }))
}

export function createGroups<
  T extends CarDatum = CarDatum,
  U extends BodyRowDatum<T> = BodyRowDatum<T>
>(
  [groupFn, ...groupFns]: ((data: U) => string)[],
  data: U[],
  parents: string[] = []
): BodyRowOrGroup<U>[] {
  if (groupFn === undefined) {
    return data
  }
  return pipe(
    groupBy<U>(groupFn),
    toPairs,
    map(([value, children]) => {
      const path = [...parents, value]
      return {
        value,
        children: createGroups(groupFns, children, path),
        path,
      }
    })
  )(data)
}

function isBodyRow<T extends CarDatum>(
  data: BodyRowOrGroup<T>
): data is BodyRowDatum<T> {
  return data.hasOwnProperty("type")
}

export function flattenGroups<T extends CarDatum = CarDatum>(
  groupOrRows: BodyRowOrGroup<T>[]
): (BodyRowDatum<T> | GroupRowDatum)[] {
  return unnest(
    groupOrRows.map((groupOrRow) => {
      if (isBodyRow<T>(groupOrRow)) {
        return [groupOrRow]
      }

      const groupHeader: GroupRowDatum = {
        type: RowType.GroupHeader,
        height: 48,
        depth: groupOrRow.path.length,
        key: JSON.stringify(groupOrRow.path),
        label: groupOrRow.value.toString(),
      }

      return [groupHeader, ...flattenGroups<T>(groupOrRow.children)]
    })
  )
}

const renderData: RowDatum<CarDatum>[] = [
  { type: RowType.Header, height: 48, key: "header" },
  ...flattenGroups(createGroups([prop("car_make")], addCommonRowData(carData))),
]

const columnDefinitions: ColumnDefinition[] = [
  { dataKey: "car_make", label: "Car Make", flex: "1 0 100px" },
  { dataKey: "car_model", label: "Car Model", flex: "1 0 100px" },
  { dataKey: "car_year", label: "Car Year", flex: "0.5 0 50px" },
  { dataKey: "country", label: "Country", flex: "1 0 100px" },
  { dataKey: "car_price", label: "Price", flex: "1 0 100px" },
  { dataKey: "comments", label: "Comments", flex: "2 0 200px" },
]

function HeaderRow(props: RowProps<HeaderRowDatum>) {
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
function GroupHeaderRow(props: RowProps<GroupRowDatum>) {
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
  props: RowProps<BodyRowDatum<T>>
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
