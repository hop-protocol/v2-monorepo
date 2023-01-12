import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { SiteWrapper } from '../components/SiteWrapper'
import { ExplorerEvents } from '../components/ExplorerEvents'

export function Main () {
  return (
    <SiteWrapper>
      <ExplorerEvents />
    </SiteWrapper>
  )
}
