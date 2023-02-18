import React from 'react'
import styled from 'styled-components'
import { Card } from '@sparkpointio/sparkswap-uikit'

export const BodyWrapper = styled(Card)`
  position: relative;
  max-width: 1024px;
  width: 100%;
  z-index: 5;
  height: auto;
  @media ( max-width: 1920px ) {
    min-height: 740px;
  } 
  @media ( max-width: 320px ) {
    width: auto;
  }
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return (
    <BodyWrapper style={{ background: 'rgba(0, 0, 0, 0)' }}>
      {children}
    </BodyWrapper>
  )
}
