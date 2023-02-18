import React, { SVGAttributes, useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { SvgProps } from 'components/SvgIcon/types'
import { ReactComponent as ChevronUp } from 'assets/svg/Up.svg'
import { ReactComponent as ChevronDown } from 'assets/svg/Down.svg'
import SvgIcon from 'components/SvgIcon'

export const ChevronUpIcon: React.FC<SvgProps> = (props) => {
  return <SvgIcon Icon={ChevronUp} />
}

export const ChevronDownIcon: React.FC<SvgProps> = (props) => {
  return <SvgIcon Icon={ChevronDown} />
}

