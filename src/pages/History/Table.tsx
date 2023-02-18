import React from 'react'
// import { useTable, usePagination } from 'react-table'
import styled, {ThemeContext} from 'styled-components'
import DataTable, { createTheme } from 'react-data-table-component'
import { dexTheme } from 'ThemeContext'

createTheme('solarized', {
    text: {
      primary: dexTheme.colors.accent1,
      secondary: dexTheme.colors.text1,
    },
    background: {
      default: dexTheme.colors.background3,
    },
    context: {
      background: dexTheme.colors.background3,
      text: '#8E98A5',

    },
    divider: {
      default: dexTheme.colors.accent1
    },
    button: {
      default: dexTheme.colors.accent1,
      disabled: dexTheme.colors.text2
    },
    sortFocus: {
      default: dexTheme.colors.accent2
    }
  });

const customStyles = {
  pagination: {
    style: {
      backgroundColor: 'transparent',
      borderTop: `1px solid ${dexTheme.colors.accent1}`
    }
  },
  header: {
    style: {
       display: 'none', 
    },
  },
  headCells: {
    style: {
      borderTop: `1px solid ${dexTheme.colors.accent1}`,
      justifyContent: 'center',
      fontWeight: 500,
      fontSize: '17px',
      '&:first-child': {
        borderLeft: `1px solid ${dexTheme.colors.accent1}`,
      },
      '&:last-child':{
        borderRight: `1px solid ${dexTheme.colors.accent1}`
      }
    },
  },
  cells: {
    style: {
      padding: '15px',
      fontSize: '2px',
      justifyContent: 'center',
      '&:first-child': {
        borderLeft: `1px solid ${dexTheme.colors.accent1}`,
      },
      '&:last-child': {
        borderRight: `1px solid ${dexTheme.colors.accent1}`,
      }
    },
  },
  
}

const paginationOptions = {
  rowsPerPageText: 'Show',
  selectAllRowsItem: false,
}

export default function Table({ columns, data }) {
  const theme = React.useContext(ThemeContext)
  const [dark, setDark ] = React.useState('defaultTheme')

  React.useEffect(() => {
    if (theme.isDark) setDark('solarized') 
    else setDark('default')
  }, [theme.isDark])
  return (
    <Container>
    <DataTable columns={columns} data={data} theme={dark} customStyles={customStyles}  paginationComponentOptions={paginationOptions} pagination  pointerOnHover paginationIconLastPage={null} paginationIconFirstPage={null}/>
    </Container>
  ) 
}

const Container = styled.div`
    padding: 0px;
    background-color: transparent;
    ${({theme}) => theme.mediaQueries.md} {
      padding: 20px;
    }
  `
