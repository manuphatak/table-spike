import React, {
  CSSProperties,
  ReactElement,
  useCallback,
  useState,
} from "react"
import Measure, { BoundingRect, ContentRect } from "react-measure"
import { VariableSizeList } from "react-window"
import styled from "styled-components"

interface TableProps {}
type Dimensions = Pick<BoundingRect, "height" | "width">

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const List = styled(VariableSizeList)`
  border: 1px solid #d9dddd;
  font-family: sans-serif;
  font-size: 12px;
  box-sizing: border-box;
`

const ListItem = styled.div<{ even: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.even ? "inherit" : "#f8f8f0")};
`

const rowHeights = new Array(1000)
  .fill(true)
  .map(() => 25 + Math.round(Math.random() * 50))

const renderRow = (props: {
  index: number
  style: CSSProperties
}): JSX.Element => (
  <ListItem even={props.index % 2 === 0} style={props.style}>
    Row {props.index}
  </ListItem>
)

const getItemSize = (index: number): number => rowHeights[index]

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
          <List
            height={dimensions.height}
            itemCount={1000}
            itemSize={getItemSize}
            width={dimensions.width}
          >
            {renderRow}
          </List>
        </Container>
      )}
    </Measure>
  )
}
