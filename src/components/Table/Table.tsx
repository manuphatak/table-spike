import React, {
  CSSProperties,
  ReactElement,
  useCallback,
  useState,
} from "react"
import Measure, { BoundingRect, ContentRect } from "react-measure"
import { VariableSizeList } from "react-window"
import styled from "styled-components"
import carData from "./carData"
import styles from "./Table.module.scss"
import classnames from "classnames/bind"

const cx = classnames.bind(styles)

interface TableProps {}
type Dimensions = Pick<BoundingRect, "height" | "width">

const Container = styled.div`
  width: 100%;
  height: 100%;
`

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

// const colDefs = [
//   { dataKey: "car_make", label: "Car Make" },
//   { dataKey: "car_model", label: "Car Model" },
//   { dataKey: "car_year", label: "Car Year" },
//   { dataKey: "country", label: "Country" },
//   { dataKey: "car_price", label: "Price", cellRenderer: CurrencyCell },
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
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: -1,
    height: -1,
  })

  const handleResize = useCallback((contentRect: ContentRect) => {
    if (contentRect.bounds) {
      setDimensions(contentRect.bounds)
    }
  }, [])

  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <Container ref={measureRef}>
          <VirtualList
            height={dimensions.height}
            itemCount={carData.length}
            itemSize={getItemSize}
            width={dimensions.width}
          >
            {renderRow}
          </VirtualList>
        </Container>
      )}
    </Measure>
  )
}
