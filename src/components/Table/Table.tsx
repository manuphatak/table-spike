import classnames from "classnames/bind"
import React, { CSSProperties, ReactElement, Key } from "react"
import { VariableSizeList } from "react-window"
import styled from "styled-components/macro"
import AutoSizer from "./AutoSizer"
import carData from "./carData"
import styles from "./Table.module.scss"

interface TableProps {}

enum RowType {
  Header,
  Body,
}

type RowData = HeaderRowData | BodyRowData
type CommonRowData = { type: RowType; height: number; key: Key }
type HeaderRowData = CommonRowData & { type: RowType.Header }
type BodyRowData = CommonRowData & { type: RowType.Body } & ArrayInfer<
    typeof carData
  >
type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never

interface ColumnDefinition {
  label: string
  dataKey: keyof ArrayInfer<typeof carData>
}

const cx = classnames.bind(styles)
console.log("styles", styles)

const VirtualList = styled(VariableSizeList)`
  box-sizing: border-box;
  *,
  :after,
  :before {
    box-sizing: inherit;
  }
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
`

const RowCell = styled.div`
  flex: 1 0 100px;
  white-space: nowrap;
  overflow: hidden;
`

const renderData: RowData[] = [
  { type: RowType.Header, height: 48, key: "header" },
  ...carData.map((car) => ({
    type: RowType.Body,
    ...car,
    height: 48,
    key: car.id,
  })),
]

const columnDefinitions: ColumnDefinition[] = [
  { dataKey: "car_make", label: "Car Make" },
  { dataKey: "car_model", label: "Car Model" },
  { dataKey: "car_year", label: "Car Year" },
  { dataKey: "country", label: "Country" },
  { dataKey: "car_price", label: "Price" },
  { dataKey: "comments", label: "Comments" },
]

const renderHeaderRow = (props: {
  index: number
  style: CSSProperties
  rowData: HeaderRowData
}) => {
  return (
    <Row
      style={props.style}
      key={props.rowData.key}
      className={cx("table__head")}
    >
      {columnDefinitions.map((columnDefinition) => {
        return (
          <RowCell className={cx("table__th")} key={columnDefinition.dataKey}>
            <label className={cx("table__th__label")}>
              {columnDefinition.label}
            </label>
          </RowCell>
        )
      })}
    </Row>
  )
}

const renderBodyRow = (props: {
  index: number
  style: CSSProperties
  rowData: BodyRowData
}) => {
  return (
    <Row style={props.style} className={cx("table__body-row")}>
      {columnDefinitions.map((columnDefinition) => {
        const cellData = props.rowData[columnDefinition.dataKey]
        return (
          <RowCell className={cx("table__td")} key={columnDefinition.dataKey}>
            <label className={cx("table__text-cell")}>{cellData}</label>
          </RowCell>
        )
      })}
    </Row>
  )
}

const renderRow = (props: {
  index: number
  style: CSSProperties
}): JSX.Element => {
  const rowData = renderData[props.index]
  switch (rowData.type) {
    case RowType.Header:
      return renderHeaderRow({
        index: props.index,
        style: props.style,
        rowData,
      })
    case RowType.Body:
      return renderBodyRow({ index: props.index, style: props.style, rowData })
  }
}

const getItemSize = (index: number): number => renderData[index].height

export default function Table(_props: TableProps): ReactElement {
  return (
    <AutoSizer>
      {({ dimensions }) => {
        return (
          <VirtualList
            height={dimensions.height}
            itemCount={renderData.length}
            itemSize={getItemSize}
            width={dimensions.width}
            className={cx("table__table")}
          >
            {renderRow}
          </VirtualList>
        )
      }}
    </AutoSizer>
  )
}
