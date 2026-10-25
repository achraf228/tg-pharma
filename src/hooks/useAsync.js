import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '../services/api'

/** Charge des données ; `deps` relance le chargement. Retourne { data, loading, error, reload, setData }. */
export default function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const seq = useRef(0)

  const run = useCallback(() => {
    const id = ++seq.current
    setState((s) => ({ ...s, loading: true, error: null }))
    fn()
      .then((data) => id === seq.current && setState({ data, loading: false, error: null }))
      .catch((e) => id === seq.current && setState({ data: null, loading: false, error: errorMessage(e) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])
  return { ...state, reload: run, setData: (data) => setState((s) => ({ ...s, data })) }
}
