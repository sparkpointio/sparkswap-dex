import React, { SVGAttributes, useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { SvgProps } from 'components/SvgIcon/types'
import SvgIcon from 'components/SvgIcon'
import { ReactComponent as MultisenderIcon } from './images/Multisender.svg'

const Icon: React.FC<SvgProps> = (props) => {
  return <SvgIcon width={124} height={124} Icon={MultisenderIcon} />
}

export default Icon
