import React from 'react'
import styled, { css } from 'styled-components'
import { dexTheme } from 'ThemeContext'
import { animated, useTransition } from 'react-spring'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { isMobile } from 'react-device-detect'
import '@reach/dialog/styles.css'
import { transparentize } from 'polished'

const AnimatedDialogOverlay = animated(DialogOverlay)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    background-color: transparent;
    overflow: hidden;
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    background-color: rgba(0, 0, 0, 0.3);
  }
`

const AnimatedDialogContent = animated(DialogContent)
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, ...rest }) => (
  <AnimatedDialogContent {...rest} />
)).attrs({
  'aria-label': 'dialog',
})`
  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    border: 1px solid ${dexTheme.colors.accent1};
    border-radius: 6px;
    background-color: ${dexTheme.colors.background1};
    box-shadow: 0 4px 8px 0 ${transparentize(0.95, '#191326')};
    padding: 0px;
    width: 80%;
    overflow: hidden;
    margin: auto;
    align-self: ${({ mobile }) => (mobile ? 'flex-end' : 'center')};

    max-width: 600px;
    ${({ maxHeight }) =>
      maxHeight &&
      css`
        max-height: ${maxHeight}vh;
      `}
    ${({ minHeight }) =>
      minHeight &&
      css`
        min-height: ${minHeight}vh;
      `}
    display: flex;


    ${({ theme }) => theme.mediaQueries.lg} {
      width: 65vw;
    }
    ${({ theme }) => theme.mediaQueries.sm} {
      width: 85vw;
    }
  }
`

interface OneColumnModalProps {
  isOpen: boolean
  onDismiss: () => void
  minHeight?: number | false
  maxHeight?: number
  initialFocusRef?: React.RefObject<any>
  children?: React.ReactNode
}

export default function OneColumnModal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 50,
  initialFocusRef,
  children,
}: OneColumnModalProps) {
  const fadeTransition = useTransition(isOpen, null, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  return (
    <>
      {fadeTransition.map(
        ({ item, key, props }) =>
          item && (
            <StyledDialogOverlay key={key} style={props} onDismiss={onDismiss} initialFocusRef={initialFocusRef}>
              <StyledDialogContent
                aria-label="dialog content"
                minHeight={minHeight}
                maxHeight={maxHeight}
                mobile={isMobile}
              >
                {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                {/* eslint-disable */}
                {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                {/* eslint-enable */}
                {children}
              </StyledDialogContent>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}
