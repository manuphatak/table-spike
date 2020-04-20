import classnames from "classnames/bind"
import { groupBy, map, pipe, toPairs, unnest } from "ramda"
import React, {
  createContext,
  CSSProperties,
  Key,
  memo,
  ReactElement,
  useContext,
  useCallback,
} from "react"
import { areEqual, ListItemKeySelector, VariableSizeList } from "react-window"
import styled from "styled-components/macro"
import CAR_DATA from "../../fixtures/CAR_DATA"
import AutoSizer, { Dimensions } from "./AutoSizer"
import styles from "./Table.module.scss"

const cx = classnames.bind(styles)

interface TableProps<T extends CarDatum> {
  initialDimensions?: Dimensions
  groups: BodyRowOrGroup<BodyRowDatum<T>>[]
  data: T[]
  columnDefinitions: ColumnDefinition<T>[]
  collapsedGroupPaths: string[]
  // TODO
  dispatch: DispatchHandler
}

export enum DispatchEvent {
  OnCollapse,
}

export type DispatchActions = {
  type: DispatchEvent.OnCollapse
  path: string
  collapsed: boolean
}
export interface DispatchHandler {
  (action: DispatchActions): void
}

export enum RowType {
  Header,
  GroupHeader,
  Body,
}

type CommonRowData = { type: RowType; height: number; key: Key }
type RowDatum<T extends CarDatum> =
  | HeaderRowDatum
  | BodyRowDatum<T>
  | GroupRowDatum
type HeaderRowDatum = CommonRowData & { type: RowType.Header }
type GroupRowDatum = CommonRowData & {
  type: RowType.GroupHeader
  label: string
  depth: number
  collapsed: boolean
  path: string
}
type BodyRowDatum<T extends CarDatum> = CommonRowData &
  T & {
    type: RowType.Body
  }

type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never
type CarDatum = ArrayInfer<typeof CAR_DATA>
type Group<T extends CarDatum> = {
  path: Key[]
  value: Key
  children: BodyRowOrGroup<T>[]
}

type BodyRowOrGroup<T extends CarDatum> = BodyRowDatum<T> | Group<T>

export interface ColumnDefinition<T extends CarDatum> {
  label: string
  dataKey: keyof T
  flex: CSSProperties["flex"]
}

export interface GroupDefinition<
  T extends CarDatum,
  U extends BodyRowDatum<T> = BodyRowDatum<T>
> {
  (data: U): Key
}

interface RowSwitchProps {
  index: number
  style: CSSProperties
}

interface RowProps<T extends CarDatum, U extends RowDatum<T>> {
  index: number
  style: CSSProperties
  rowData: U
}

export interface RowDefinitions<T> {
  [RowType.Body]: {
    height: number
    keyFn: (datum: T) => Key
  }
}

const StyledList = memo(
  styled(VariableSizeList)`
    box-sizing: border-box;

    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }
    color: #4d4d4d;
  `,
  areEqual
)

const StyledRow = styled.div`
  && {
    display: flex;
    flex-flow: row nowrap;
    margin: 0;
    padding: 0;
    align-items: center;
  }
`

const StyledCell = styled.div<{ flex: CSSProperties["flex"] }>`
  && {
    flex: ${(props) => props.flex};
    white-space: nowrap;
    overflow: hidden;
  }
`

const GroupHeaderRowTitle = styled.div`
  && {
    padding: 0;
    font-weight: 700;
  }
`

const StyledCollapseButton = styled.button<{}>`
  && {
    flex: 0 0 48px;
    white-space: nowrap;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 11px;
    height: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    background: inherit;
    border: none;
    cursor: pointer;
  }
`
interface CollapseButtonProps {
  collapsed: boolean
  path: string
  className?: string
}
const CollapseButton = (props: CollapseButtonProps) => {
  const dispatch = useContext(DispatchContext)

  const handleClick = useCallback(() => {
    dispatch({
      type: DispatchEvent.OnCollapse,
      path: props.path,
      collapsed: !props.collapsed,
    })
  }, [dispatch, props.path, props.collapsed])

  return (
    <StyledCollapseButton onClick={handleClick} className={props.className}>
      <i
        className={cx("ci", "icon", "ci-chevron-right", {
          "table__carat--expanded": !props.collapsed,
        })}
      ></i>
    </StyledCollapseButton>
  )
}

export function groupPaths<T extends CarDatum>(
  groupOrRows: BodyRowOrGroup<T>[]
): string[] {
  return unnest(
    groupOrRows.map((groupOrRow) => {
      if (isBodyRow<T>(groupOrRow)) {
        return []
      }

      return [
        JSON.stringify(groupOrRow.path),
        ...groupPaths<T>(groupOrRow.children),
      ]
    })
  ).sort()
}

export function addCommonRowData<T extends CarDatum>(
  rowDefinitions: RowDefinitions<T>,
  data: T[]
): BodyRowDatum<T>[] {
  return data.map((datum) => ({
    type: RowType.Body,
    ...datum,
    height: rowDefinitions[RowType.Body].height,
    key: rowDefinitions[RowType.Body].keyFn(datum),
  }))
}

function asString<U>(fn: (a: U) => Key): (a: U) => string {
  return (data) => fn(data).toString()
}

export function createGroups<
  T extends CarDatum,
  U extends BodyRowDatum<T> = BodyRowDatum<T>
>(
  [groupDefinition, ...groupDefinitions]: GroupDefinition<T>[],
  data: U[],
  parents: Key[] = []
): BodyRowOrGroup<U>[] {
  if (groupDefinition === undefined) {
    return data
  }
  return pipe(
    groupBy<U>(asString(groupDefinition)),
    toPairs,
    map(([value, children]) => {
      const path = [...parents, value]
      return {
        value,
        children: createGroups(groupDefinitions, children, path),
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

export function flattenGroups<T extends CarDatum>(
  collapsedGroupPaths: string[],
  groupOrRows: BodyRowOrGroup<T>[]
): (BodyRowDatum<T> | GroupRowDatum)[] {
  return unnest(
    groupOrRows.map((groupOrRow) => {
      if (isBodyRow<T>(groupOrRow)) {
        return [groupOrRow]
      }

      const key = JSON.stringify(groupOrRow.path)
      const collapsed = collapsedGroupPaths.includes(key)

      const groupHeader: GroupRowDatum = {
        type: RowType.GroupHeader,
        height: 48,
        depth: groupOrRow.path.length - 1,
        key,
        collapsed,
        label: groupOrRow.value.toString(),
        path: key,
      }
      const children = collapsed
        ? []
        : flattenGroups<T>(collapsedGroupPaths, groupOrRow.children)

      return [groupHeader, ...children]
    })
  )
}
function generateTableData<T extends CarDatum>(
  collapsedGroupPaths: string[],
  groups: BodyRowOrGroup<BodyRowDatum<T>>[]
): RowDatum<T>[] {
  return [
    { type: RowType.Header, height: 48, key: "header" },
    ...flattenGroups(collapsedGroupPaths, groups),
  ]
}

export function generateGroups<T extends CarDatum>(
  rowDefinitions: RowDefinitions<T>,
  groupDefinitions: GroupDefinition<T, BodyRowDatum<T>>[],
  data: T[]
): BodyRowOrGroup<BodyRowDatum<T>>[] {
  return createGroups(groupDefinitions, addCommonRowData(rowDefinitions, data))
}

function GroupHeaderRow<T extends CarDatum>(props: RowProps<T, GroupRowDatum>) {
  return (
    <StyledRow
      style={props.style}
      key={props.rowData.key}
      className={cx("table__group-row", "table__group-row__content")}
    >
      <StyledCell flex={`0 0 ${props.rowData.depth * 24}px`} />
      <CollapseButton
        collapsed={props.rowData.collapsed}
        path={props.rowData.path}
      ></CollapseButton>
      <GroupHeaderRowTitle className={cx("table__group-row__title")}>
        {props.rowData.label}
      </GroupHeaderRowTitle>
    </StyledRow>
  )
}

const ColumnDefinitionsContext = createContext<ColumnDefinition<any>[]>([])
ColumnDefinitionsContext.displayName = "ColumnDefinitionsContext"
const TableDataContext = createContext<RowDatum<any>[]>([])
TableDataContext.displayName = "TableDataContext"
const DispatchContext = createContext<(action: DispatchActions) => void>(
  () => {}
)
DispatchContext.displayName = "DispatchContext"

const BodyRow = function BodyRow<T extends CarDatum>(
  props: RowProps<T, BodyRowDatum<T>>
) {
  const columnDefinitions = useContext<ColumnDefinition<T>[]>(
    ColumnDefinitionsContext
  )

  return (
    <StyledRow style={props.style} className={cx("table__body-row")}>
      <StyledCell key={"chevron"} flex={"0 0 48px"}></StyledCell>
      {columnDefinitions.map((columnDefinition) => (
        <StyledCell
          className={cx("table__td")}
          // TODO figure out why TS believes this could be undefined
          key={columnDefinition.dataKey as string}
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

function HeaderRow<T extends CarDatum>(props: RowProps<T, HeaderRowDatum>) {
  const columnDefinitions = useContext<ColumnDefinition<T>[]>(
    ColumnDefinitionsContext
  )

  return (
    <StyledRow
      style={props.style}
      key={props.rowData.key}
      className={cx("table__head")}
    >
      <CollapseButton
        className={cx("table__th")}
        collapsed={false}
        path={""}
      ></CollapseButton>

      {columnDefinitions.map((columnDefinition) => (
        <StyledCell
          className={cx("table__th")}
          // TODO figure out why TS believes this could be undefined
          key={columnDefinition.dataKey as string}
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
const RowSwitch = memo(function RowSwitch<T extends CarDatum>(
  props: RowSwitchProps
): JSX.Element {
  const tableData = useContext<RowDatum<T>[]>(TableDataContext)
  const rowData = tableData[props.index]

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
},
areEqual)

export default function Table<T extends CarDatum>(
  props: TableProps<T>
): ReactElement {
  const tableData = generateTableData(props.collapsedGroupPaths, props.groups)
  const getItemSize = (index: number): number => tableData[index].height
  const getItemKey: ListItemKeySelector = (index) => tableData[index].key

  return (
    <DispatchContext.Provider value={props.dispatch}>
      <ColumnDefinitionsContext.Provider value={props.columnDefinitions}>
        <TableDataContext.Provider value={tableData}>
          <AutoSizer initialDimensions={props.initialDimensions}>
            {({ dimensions }) => (
              <StyledList
                height={dimensions.height}
                itemCount={tableData.length}
                itemSize={getItemSize}
                width={dimensions.width}
                className={cx("table__table")}
                itemKey={getItemKey}
              >
                {RowSwitch}
              </StyledList>
            )}
          </AutoSizer>
        </TableDataContext.Provider>
      </ColumnDefinitionsContext.Provider>
    </DispatchContext.Provider>
  )
}
