import classnames from "classnames/bind"
import React, { CSSProperties, ReactElement } from "react"
import { VariableSizeList } from "react-window"
import styled from "styled-components/macro"
import AutoSizer from "./AutoSizer"
import carData from "./carData"
import styles from "./Table.module.scss"

const cx = classnames.bind(styles)

interface TableProps {}

const VirtualList = styled(VariableSizeList)`
  box-sizing: border-box;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
`

const RowColumn = styled.div`
  flex: 1 0 100px;
  white-space: nowrap;
  overflow: hidden;
`

const renderableCarData = carData.map((car) => ({
  ...car,
  height: 48,
}))

// const columnDefinitions = [
//   { dataKey: "car_make", label: "Car Make" },
//   { dataKey: "car_model", label: "Car Model" },
//   { dataKey: "car_year", label: "Car Year" },
//   { dataKey: "country", label: "Country" },
//   { dataKey: "car_price", label: "Price" },
//   { dataKey: "comments", label: "Comments" },
// ]

const renderRow = (props: {
  index: number
  style: CSSProperties
}): JSX.Element => {
  const rowData = renderableCarData[props.index]
  return (
    <Row style={props.style} className={cx("table__body-row")}>
      <RowColumn className={cx("table__td")}>
        <label className={cx("table__text-cell")}>{rowData.car_make}</label>
      </RowColumn>
      <RowColumn className={cx("table__td")}>
        <label className={cx("table__text-cell")}>{rowData.car_model}</label>
      </RowColumn>
      <RowColumn className={cx("table__td")}>
        <label className={cx("table__text-cell")}>{rowData.car_year}</label>
      </RowColumn>
      <RowColumn className={cx("table__td")}>
        <label className={cx("table__text-cell")}>{rowData.country}</label>
      </RowColumn>
      <RowColumn className={cx("table__td")}>
        <label className={cx("table__text-cell")}>{rowData.car_price}</label>
      </RowColumn>
      <RowColumn className={cx("table__td")}>
        <label className={cx("table__text-cell")}>{rowData.comments}</label>
      </RowColumn>
    </Row>
  )
}

const getItemSize = (index: number): number => renderableCarData[index].height

export default function Table(_props: TableProps): ReactElement {
  return (
    <AutoSizer>
      {({ dimensions }) => (
        <VirtualList
          height={dimensions.height}
          itemCount={carData.length}
          itemSize={getItemSize}
          width={dimensions.width}
        >
          {renderRow}
        </VirtualList>
      )}
    </AutoSizer>
  )
}
