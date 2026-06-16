import React, { createContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export const FeatureFlagsContext = createContext(null)

export function FeatureFlagsProvider({ children }) {
  const [flags, setFlags] = useState({})
  const [loading, setLoading] = useState(true)

  const loadFlags = useCallback(() => {
    setLoading(true)
    api.featureFlags.list()
      .then((list) => {
        const map = {}
        list.forEach(f => { map[f.key] = f })
        setFlags(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadFlags()
  }, [loadFlags])

  const isActive = useCallback((key) => {
    const flag = flags[key]
    if (!flag) return true
    return flag.active
  }, [flags])

  const getBehavior = useCallback((key) => {
    const flag = flags[key]
    if (!flag || flag.active) return null
    return flag.behavior_on_inactive || 'hide'
  }, [flags])

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, isActive, getBehavior, refresh: loadFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}
