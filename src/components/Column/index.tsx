import styled from 'styled-components'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
  margin: auto;
`

export const AutoColumn = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
`

export const LiquidityAutoColumn = styled(AutoColumn) `
  margin: 0 3em 0 3em;
  @media(max-width: 500px) {
    margin: auto;
  }
`

export const StyledOptions = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  @media (max-width: 450px){
    justify-content: flex-start;
    flex-direction: column;
  }
`

export const StyledAutoColumn = styled(Column)`
  flex-direction: row;
  margin-bottom: 10px;
  @media (max-width: 768px){
    flex-direction: column;
  }
`

export const CustomStyledAutoColumn = styled(Column)`
  flex-direction: column;
  // margin-bottom: 10px;
  margin: 0 3em 0 3em;
  @media (max-width: 768px){
    flex-direction: column;
    margin: auto;
  }
`

export const StyledInputContainer = styled.div`
  width: 100%;
`


export default Column
