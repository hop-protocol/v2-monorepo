import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useInterval } from 'react-use'
import { apiUrl } from '../config'

export function useEvents (eventName: string, filter: any = {}, onPagination?: any, queryParams?: any) {
  const [events, setEvents] = useState([])
  const [page, setPage] = useState(queryParams?.page || 1)
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

  const updateEvents = async (page: number) => {
    try {
      let pathname = '/events'
      if (eventName === 'explorer')  {
        pathname = '/explorer2'
      }
      const url = `${apiUrl}/v1${pathname}?limit=${limit}&page=${page || 1}&eventName=${eventName}${filterString}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.error) {
        throw new Error(json.error)
      }
      if (!json.events) {
        throw new Error('no events')
      }
      setEvents(json.events)
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
    updateEventsCb(page).catch(console.error)
  }, [updateEventsCb, page])

  useInterval(updateEvents, 10 * 1000)

  async function previousPage (event: any) {
    event.preventDefault()
    if (onPagination) {
      const newPage = (Number(page) - 1) || 1
      setPage(newPage)
      onPagination({ page: newPage })
    }
  }

  async function nextPage (event: any) {
    event.preventDefault()
    if (onPagination) {
      const newPage = (Number(page) + 1) || 1
      setPage(newPage)
      onPagination({ page: newPage })
    }
  }

  // const showNextButton = events.length === limit
  const showNextButton = events.length > 0
  const showPreviousButton = events.length > 0

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
