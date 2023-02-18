import { useContext } from 'react'
import { ReloadContext } from 'contexts/ReloadContext'

const useReload = () => {
  const { reload, handleReload } = useContext(ReloadContext);
  return { reload, handleReload}
}

export default useReload;