import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { dexTheme } from 'ThemeContext'
import Popover, { PopoverProps } from '../Popover'

const TooltipContainer = styled.div`
  width: 228px;
  padding: 0.6rem 1rem;
  line-height: 150%;
  font-weight: 400;
  // background-color: ${dexTheme.colors.background1} !important;
  color: ${dexTheme.colors.accent1} !important;
  box-shadow: 0px 2px 2px ${dexTheme.colors.accent2};
  &:after {
    border-top-color: ${dexTheme.colors.text2} !important;
  }
  
`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  text: string
}

export default function Tooltip({ text, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

export function MouseoverTooltip({ children, ...rest }: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip {...rest} show={show}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </Tooltip>
  )
}
