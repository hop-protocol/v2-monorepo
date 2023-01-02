import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useInterval } from 'react-use'
import { apiUrl } from '../config'

export function useEvents (eventName: string) {
  const [events, setEvents] = useState([])
  const [lastKey, setLastKey] = useState('')
  const limit = 10

  const updateEvents = async (_lastKey: string = '') => {
    try {
      const url = `${apiUrl}/v1/events?limit=${limit}&lastKey=${_lastKey}&eventName=${eventName}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.error) {
        throw new Error(json.error)
      }
      if (!json.events) {
        throw new Error('no events')
      }
      setEvents(json.events)
      setLastKey(json.lastKey ?? '')
    } catch (err: any) {
      console.error(err.message)
    }
  }

  const updateEventsCb = useCallback(updateEvents, [])

  useEffect(() => {
    updateEventsCb().catch(console.error)
  }, [updateEventsCb])

  useInterval(updateEvents, 10 * 1000)

  function nextPage (event: any) {
    event.preventDefault()
    updateEventsCb(lastKey)
  }

  const showNextButton = events.length === limit

  return {
    events,
    nextPage,
    limit,
    showNextButton
  }
}
