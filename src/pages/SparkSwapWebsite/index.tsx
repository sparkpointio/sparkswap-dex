import React, { useEffect } from 'react'
import * as AppSections from './components'
import PageLoader from './Loader'
import './assets/fonts/quatro/stylesheet.css'
import './components/styles/_style.css'
import './components/styles/App.css'

const Sections = (AppSections as unknown) as { [key: string]: React.FC }
const App = () => {
  useEffect(() => {
    document.title = 'SparkSwap - The preferred DeFi exchange on Binance Smart Chain (BSC)'
  })
  
  return (
    <div className="main">
      {Object.keys(Sections).map(function (key) {
        const Section = Sections[key] as React.FC
        return <Section key={key} />
      })}
    </div>
  )
}

export default App
