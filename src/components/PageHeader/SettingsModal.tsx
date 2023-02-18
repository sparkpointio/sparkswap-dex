import React, { Dispatch, useContext, useEffect } from 'react'
import { Button, Flex, Modal, Text } from '@sparkpointio/sparkswap-uikit'
import styled from 'styled-components'
import { dexTheme } from 'ThemeContext'
import SlippageToleranceSetting from './SlippageToleranceSetting'
import TransactionDeadlineSetting from './TransactionDeadlineSetting'
import { innerReducer, initialState} from '../../hooks/slippageController';


type SettingsModalProps = {
  onDismiss?: () => void,
  action?: Dispatch<{type: string}>

}

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  // padding: 20px;
  margin: 10px 0px;
  margin-top: -30px;
  // background-color: ${dexTheme.colors.background};

`

const ConfirmButton = styled(Button)`
  // height: 50px;
  // border-radius: 3px;
  // width: 50px;
  height: 40px;
  background: linear-gradient(to right, ${dexTheme.colors.accent2}, ${dexTheme.colors.accent1});
  border-radius: 4px;
`

const StyledFooter = styled(Flex)`
  // max-width: 200px;
  justify-content: center;
  width: 100%;
  align-items: center;
`
// TODO: Fix UI Kit typings
const defaultOnDismiss = () => null

const SettingsModal = ({ onDismiss = defaultOnDismiss, action }: SettingsModalProps) => {

  const [ state, dispatch ] = React.useReducer(innerReducer, initialState);

  return (
    <Modal title="" onDismiss={onDismiss} bodyPadding='15px' background="#15151A" border="2px solid #39BEEC">
      <ModalContainer>
      <Flex>
        <SlippageToleranceSetting action={dispatch} action2={dispatch} />
      </Flex>
      <StyledFooter>
        <Flex flexDirection="column" alignItems="center">
        <Text>Transaction Deadline</Text>
        <TransactionDeadlineSetting onDismiss={onDismiss}/>
        <ConfirmButton onClick={onDismiss}> <Text fontSize='13px'> Confirm </Text></ConfirmButton>
        </Flex>
        {/* <ConfirmButton onClick={onDismiss} variant="secondary" > <Text fontSize='15px'> Confirm </Text></ConfirmButton> */}
      </StyledFooter>
      { state.slipWarning && <Text color="textSubtle" mt="8px" fontSize='12px'>Note: Setting to 0.1% may fail the transaction. Proceed with caution.</Text> }
      </ModalContainer>
    </Modal>
  )
}

export default SettingsModal
