import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import { Main } from './pages/Main'
import { Events } from './pages/Events'
import { NotFound } from './pages/NotFound'
import './App.css'

function App () {
  return (
    <Switch>
      <Route path="/" exact component={Main} />
      <Route path="/events" component={Events} />
      <Route component={NotFound} />
    </Switch>
  )
}

export default App
