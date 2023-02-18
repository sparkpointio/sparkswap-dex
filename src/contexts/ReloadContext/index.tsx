import { useWeb3React } from '@web3-react/core';
import React, { createContext, useEffect, useState } from 'react';


interface ReloadContextInterface {
  reload: boolean | null;
  handleReload: (state:boolean) => void;
}
 
const ReloadContext = createContext<ReloadContextInterface>({reload: true, handleReload: (state:boolean) => null })

const ReloadProvider: React.FC = ({children}) => {
  const { account } = useWeb3React();
  const [reload, setReload ] = useState(() => {
    return account ? true : null
  });
  const handleReload = (state:boolean) => {
    setReload(state);
  }

  useEffect(() => {
    if (account) {
      handleReload(true)
    }
  }, [account])

  return (
    <ReloadContext.Provider value={{reload, handleReload}}>
      {children}
    </ReloadContext.Provider>
  )
}

export { ReloadContext, ReloadProvider}