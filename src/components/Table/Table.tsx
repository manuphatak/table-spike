import React, {
  CSSProperties,
  ReactElement,
  useState,
  useCallback,
} from "react"
import Measure, { BoundingRect, ContentRect } from "react-measure"
import { VariableSizeList } from "react-window"
import styles from "./Table.module.css"

interface TableProps {}

type P = Pick<BoundingRect, "height" | "width">
export default function Table(_props: TableProps): ReactElement {
  const [dimensions, setDimensions] = useState<P>({
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
        <div ref={measureRef} style={{ width: "100%", height: "100%" }}>
          <VariableSizeList
            className={styles.List}
            height={dimensions.height}
            itemCount={1000}
            itemSize={getItemSize}
            width={dimensions.width}
          >
            {renderRow}
          </VariableSizeList>
        </div>
      )}
    </Measure>
  )
}

const rowHeights = new Array(1000)
  .fill(true)
  .map(() => 25 + Math.round(Math.random() * 50))

const renderRow = ({
  index,
  style,
}: {
  index: number
  style: CSSProperties
}): JSX.Element => (
  <div
    className={index % 2 ? styles["ListItemOdd"] : styles["ListItemEven"]}
    style={style}
  >
    Row {index}
  </div>
)

const getItemSize = (index: number): number => rowHeights[index]
