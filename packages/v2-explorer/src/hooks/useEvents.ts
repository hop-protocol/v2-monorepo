import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useInterval } from 'react-use'
import { apiUrl } from '../config'

export function useEvents (eventName: string) {
  const [events, setEvents] = useState([])
  const [lastKey, setLastKey] = useState('')
  const [firstKey, setFirstKey] = useState('')
  const [lastUrl, setLastUrl] = useState('')
  const limit = 10

  const updateEvents = async (_lastKey: string = '', _firstKey: string = '') => {
    try {
      const url = lastUrl || `${apiUrl}/v1/events?limit=${limit}&lastKey=${_lastKey}&firstKey=${_firstKey}&eventName=${eventName}`
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
      setFirstKey(json.firstKey ?? '')
      return url
    } catch (err: any) {
      console.error(err.message)
    }
    return ''
  }

  const updateEventsCb = useCallback(updateEvents, [])

  useEffect(() => {
    updateEventsCb().catch(console.error)
  }, [updateEventsCb])

  useInterval(updateEvents, 10 * 1000)

  async function previousPage (event: any) {
    event.preventDefault()
    setLastUrl(await updateEventsCb('', firstKey))
  }

  async function nextPage (event: any) {
    event.preventDefault()
    setLastUrl(await updateEventsCb(lastKey, ''))
  }

  const showNextButton = events.length === limit && !!lastKey
  const showPreviousButton = events.length > 0 && !!firstKey

  return {
    events,
    nextPage,
    previousPage,
    limit,
    showNextButton,
    showPreviousButton
  }
}
