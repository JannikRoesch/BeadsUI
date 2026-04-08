import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CreateIssueModal } from './components/CreateIssueModal'
import { CommandPalette } from './components/CommandPalette'
import { Dashboard } from './pages/Dashboard'
import { IssueList } from './pages/IssueList'
import { IssueDetail } from './pages/IssueDetail'
import { GraphView } from './pages/GraphView'
import { Memories } from './pages/Memories'
import { Settings } from './pages/Settings'
import { Search } from './pages/Search'
import { Epics } from './pages/Epics'
import { useKeyboard } from './lib/useKeyboard'

function AppInner() {
  const [createOpen, setCreateOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const navigate = useNavigate()

  useKeyboard({
    'Meta+k': () => setPaletteOpen(true),
    'Ctrl+k': () => setPaletteOpen(true),
    'Escape': () => { setPaletteOpen(false) },
    'c': () => setCreateOpen(true),
    'g+d': () => navigate('/'),
    'g+i': () => navigate('/issues'),
    'g+g': () => navigate('/graph'),
    'g+e': () => navigate('/epics'),
    'g+m': () => navigate('/memories'),
    '/': () => navigate('/search'),
  })

  return (
    <>
      <Routes>
        <Route element={<AppShell onSearch={() => setPaletteOpen(true)} onCreateIssue={() => setCreateOpen(true)} />}>
          <Route index element={<Dashboard />} />
          <Route path="issues" element={<IssueList onCreateIssue={() => setCreateOpen(true)} />} />
          <Route path="issues/:id" element={<IssueDetail />} />
          <Route path="graph" element={<GraphView />} />
          <Route path="epics" element={<Epics />} />
          <Route path="memories" element={<Memories />} />
          <Route path="search" element={<Search />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      <CreateIssueModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onCreateIssue={() => { setPaletteOpen(false); setCreateOpen(true) }}
      />
    </>
  )
}

export default function App() {
  return <AppInner />
}
