
// eslint-disable-next-line import/no-unresolved
import { SparkSwapTheme } from '@sparkpointio/sparkswap-uikit/dist/theme'
import { DexProperty } from './../ThemeContext';

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends SparkSwapTheme {
    dexTheme: {
      [key:string]: {
        [key:string]: string
      } 
    }
  }
}

