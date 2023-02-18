import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Spinner } from '@sparkpointio/sparkswap-uikit'


const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

const PageLoader: React.FC = () => {

  return (
    <Wrapper>
      <Spinner />
    </Wrapper>
  )
}

export default PageLoader