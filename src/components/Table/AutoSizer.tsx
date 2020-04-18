import React, { ReactElement, useCallback, useState } from "react"
import Measure, { BoundingRect, ContentRect } from "react-measure"
import styled from "styled-components"

type Dimensions = Pick<BoundingRect, "height" | "width">

interface AutoSizerProps {
  children: (props: { dimensions: Dimensions }) => React.ReactNode
}

const Container = styled.div`
  width: 100%;
  height: 100%;
`

export default function AutoSizer(props: AutoSizerProps): ReactElement {
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
        <Container ref={measureRef}>{props.children({ dimensions })}</Container>
      )}
    </Measure>
  )
}
