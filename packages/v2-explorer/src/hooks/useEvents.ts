import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useInterval } from 'react-use'
import { apiUrl } from '../config'

export function useEvents (eventName: string, filter: any = {}) {
  const [events, setEvents] = useState([])
  const [lastKey, setLastKey] = useState('')
  const [firstKey, setFirstKey] = useState('')
  const [lastUrl, setLastUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 10

  const filterString = useMemo(() => {
    let str = ''
    for (const key in filter) {
      const value = filter[key]
      if (value) {
        str += `&filter[${key}]=${value}`
      }
    }
    return str
  }, [filter])

  const updateEvents = async (_lastKey: string = '', _firstKey: string = '') => {
    try {
      let pathname = '/events'
      if (eventName === 'explorer')  {
        pathname = '/explorer'
      }
      const url = lastUrl || `${apiUrl}/v1${pathname}?limit=${limit}&lastKey=${_lastKey}&firstKey=${_firstKey}&eventName=${eventName}${filterString}`
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
      setLoading(false)
      return url
    } catch (err: any) {
      console.error(err.message)
    }
    setLoading(false)
    return ''
  }

  const updateEventsCb = useCallback(updateEvents, [filterString])

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
    showPreviousButton,
    loading
  }
}
