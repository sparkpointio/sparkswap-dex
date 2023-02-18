import * as React from 'react'
import {useMediaQuery} from '@mui/material'
import {Trade} from '@sparkpointio/sparkswap-sdk'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import {styled, useTheme} from '@mui/material/styles'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import {Text} from '@sparkpointio/sparkswap-uikit'
import {StepIconProps} from '@mui/material/StepIcon'
import {useWeb3React} from '@web3-react/core'
import StepConnector, {stepConnectorClasses} from '@mui/material/StepConnector'
import {Check} from 'react-feather'
import {ApprovalState} from 'hooks/useApproveCallback'

const steps = ['Connect Wallet', 'Choose tokens', 'Enter amount', 'Enable swap', 'Confirm', 'Receive']

const ProgressConnector = styled(StepConnector)(({theme}) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
        '@media screen and (max-width: 600px)': {
            top: 15
        },
        '@media screen and (max-width: 280px)': {
            top: 10
        }
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundColor:
                '#00bf00',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundColor:
                '#00bf00',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: '#39BEEC',
        borderRadius: 1,
    },
}))

const ProgressStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
    backgroundColor: '#39BEEC',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    '@media screen and (max-width: 600px)': {
        width: 32,
        height: 32,
        margin: '0px 5px 0px 5px'
    },
    '@media screen and (max-width: 280px)': {
        width: 20,
        height: 20,
        margin: '0px 5px 0px 5px'
    },
    ...(ownerState.active && {
        backgroundColor: '#0073c2',
        border: '5px solid #39BEEC',
        '@media screen and (max-width: 600px)': {
            width: 32,
            height: 32,
            margin: '0px 5px 0px 5px'
        },
        '@media screen and (max-width: 280px)': {
            width: 20,
            height: 20,
            margin: '0px 5px 0px 5px'
        },
    }),
    ...(ownerState.completed && {
        backgroundColor:
            '#00bf00',
        width: 40,
        height: 40,
        '@media screen and (max-width: 600px)': {
            width: 32,
            height: 32,
            margin: '0px 5px 0px 5px'
        },
        '@media screen and (max-width: 280px)': {
            width: 20,
            height: 20,
            margin: '0px 5px 0px 5px'
        },
    }),
}));


function ProgressStepIcon(props: StepIconProps) {
    const {active, completed, className, icon} = props
    return (
        <ProgressStepIconRoot ownerState={{completed, active}} className={className}>
            <div>
                {completed ? <Check/> : icon}
            </div>
        </ProgressStepIconRoot>
    )
}

export default function HorizontalStepperWithError({approveState, attemptingTxn, txHash, trade, swapInputError}: {
    approveState?: any; attemptingTxn?: boolean; txHash?: any; trade?: Trade, swapInputError?: string
}) {
    const muiTheme = useTheme()
    const desktop = useMediaQuery(muiTheme.breakpoints.up('sm'));
    const {account} = useWeb3React()
    const [activeStep, setActiveStep] = React.useState<number>(0)
    const [hash, setHash] = React.useState<string>('')
    const isStepFailed = (step: number) => {
        return step === 6
    }

    React.useEffect(() => {
        if (account) {
            setActiveStep(1)
        }

    }, [account])

    React.useEffect(() => {
        if (account) {
            setActiveStep(1)
            if (swapInputError !== 'Select a token') {
                setActiveStep(2);
            }
            if (!swapInputError) {
                setActiveStep(3);
                if (approveState.approval === ApprovalState.APPROVED) {
                    setActiveStep(4);
                }
                if (attemptingTxn) {
                    setActiveStep(5);
                }
                if (txHash) {
                    setActiveStep(6);
                }
            }
        }
    }, [approveState, account, swapInputError, attemptingTxn, txHash])

    return (
        <Box sx={{justifyContent: 'center', '@media (min-width: 600px)': {width: '100%'}}}>
            <Stepper activeStep={activeStep} alternativeLabel connector={<ProgressConnector/>}>
                {steps.map((label, index) => {
                    const labelProps: {
                        optional?: React.ReactNode
                        error?: boolean
                    } = {}
                    if (isStepFailed(index)) {
                        labelProps.optional = (
                            <Typography variant="caption" color="error">
                                Alert message
                            </Typography>
                        )
                        labelProps.error = false
                    }

                    return (
                        <Step key={label} sx={{
                            '@media screen and (max-width: 600px)': {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                minHeight: '100px',
                                textAlign: 'center'
                            }
                        }}>
                            <StepLabel {...labelProps} StepIconComponent={ProgressStepIcon}>
                                {desktop && <Text
                                    color={isStepFailed(index) ? 'error' : '#39BEEC'}>{activeStep <= index && label}</Text>}
                            </StepLabel>
                            {!desktop &&
                                <Typography sx={{mt: 2, '@media screen and (max-width: 600px)': {fontSize: '10.5px'}, '@media screen and (max-width: 280px)': {fontSize: '8.5px'}}}
                                            color='#39BEEC'>{activeStep <= index && label}</Typography>}
                        </Step>
                    )
                })}

            </Stepper>
        </Box>
    )
}
