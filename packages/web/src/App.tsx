import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CreateIssueModal } from './components/CreateIssueModal'
import { Dashboard } from './pages/Dashboard'
import { IssueList } from './pages/IssueList'
import { IssueDetail } from './pages/IssueDetail'
import { GraphView } from './pages/GraphView'
import { Memories } from './pages/Memories'
import { Settings } from './pages/Settings'

export default function App() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="issues" element={<IssueList onCreateIssue={() => setCreateOpen(true)} />} />
          <Route path="issues/:id" element={<IssueDetail />} />
          <Route path="graph" element={<GraphView />} />
          <Route path="memories" element={<Memories />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      <CreateIssueModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}
