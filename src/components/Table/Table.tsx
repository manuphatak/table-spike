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
type RowData<T extends CarDatum = CarDatum> =
  | HeaderRowData
  | BodyRowData<T>
  | GroupRowData
type HeaderRowData = CommonRowData & { type: RowType.Header }
type GroupRowData = CommonRowData & {
  type: RowType.GroupHeader
  label: string
  depth: number
}
type BodyRowData<T extends CarDatum> = CommonRowData &
  T & {
    type: RowType.Body
  }

type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never

type CarDatum = ArrayInfer<typeof carData>

const GROUP_TYPE = Symbol("GROUP_TYPE")
type Group<T extends CarDatum & CommonRowData> = {
  groupParents: string[]
  groupValue: Key
  groupData: Array<EitherGroup<T>>
}

type EitherGroup<
  T extends CarDatum & CommonRowData = CarDatum & CommonRowData
> = RowData<T> | Group<T>

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

export function addCommonRowData<T extends CarDatum = CarDatum>(
  data: T[]
): Array<T & CommonRowData> {
  return data.map((datum) => ({
    type: RowType.Body,
    ...datum,
    height: 48,
    key: datum.id,
  }))
}

export function createGroups<
  T extends CarDatum = CarDatum,
  U extends T & CommonRowData = T & CommonRowData
>(
  [groupFn, ...groupFns]: ((data: U) => string)[],
  data: U[],
  parents: string[] = []
): EitherGroup<U>[] {
  if (groupFn === undefined) {
    return data
  }
  return pipe(
    groupBy<U>(groupFn),
    toPairs,
    map(([groupValue, groupData]) => {
      const groupParents = [...parents, groupValue]
      return createGroup<U>({
        groupValue,
        groupData: createGroups(groupFns, groupData, groupParents),
        groupParents,
      })
    })
  )(data)
}

function createGroup<
  U extends CarDatum & CommonRowData = CarDatum & CommonRowData
>({ groupValue, groupData, groupParents }: Group<U>): Group<U> {
  return Object.defineProperty(
    {
      groupValue: groupValue,
      groupData: groupData,
      groupParents: groupParents,
    },
    GROUP_TYPE,
    {}
  )
}

function isGroup<T extends CarDatum & CommonRowData>(
  eitherGroup: EitherGroup<T>
): eitherGroup is Group<T> {
  return eitherGroup.hasOwnProperty(GROUP_TYPE)
}

function unravel<T extends CarDatum & CommonRowData = CarDatum & CommonRowData>(
  groupOrRow: EitherGroup<T>
): RowData<T> | RowData<T>[] {
  if (isGroup(groupOrRow)) {
    const groupHeader: GroupRowData = {
      type: RowType.GroupHeader,
      height: 48,
      depth: groupOrRow.groupParents.length,
      key: groupOrRow.groupParents.join("::"),
      label: groupOrRow.groupValue.toString(),
    }
    const groupChildren: RowData<T>[] = flattenGroups<T>(groupOrRow.groupData)
    const groupRows: RowData<T>[] = [groupHeader, ...groupChildren]
    return groupRows
  }
  const row: RowData<T> = groupOrRow
  return row
}

export function flattenGroups<
  T extends CarDatum & CommonRowData = CarDatum & CommonRowData
>(groupOrRows: EitherGroup<T>[]): RowData<T>[] {
  const rows: RowData<T>[] | RowData<T>[][] = groupOrRows.map(unravel)

  const result: RowData<T>[] = unnest(rows)

  return result
}

const renderData: RowData<CarDatum>[] = [
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
