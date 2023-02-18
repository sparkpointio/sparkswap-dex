import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Spinner } from '@sparkpointio/sparkswap-uikit'
import './loader.css'


const PageLoader: React.FC = () => {
  const [hidden, isHidden] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      isHidden(true)
    }, 2000)
  }, [])
  return (
    <div id='loader' className={hidden ? 'hide': ''}>
      <Spinner/>
    </div>
  )
}

export default PageLoader