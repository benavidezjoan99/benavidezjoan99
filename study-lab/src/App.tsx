import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { ExamPage } from '@/pages/ExamPage'
import { HomePage } from '@/pages/HomePage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ToolsPage } from '@/pages/ToolsPage'
import { useExamStore } from '@/store/exam-store'
import { useProjectStore } from '@/store/project-store'

export default function App() {
  const hydrateExam = useExamStore((s) => s.hydrate)
  const examReady = useExamStore((s) => s.ready)
  const hydrateProjects = useProjectStore((s) => s.hydrate)
  const projectsReady = useProjectStore((s) => s.ready)

  useEffect(() => {
    void hydrateExam()
    void hydrateProjects()
  }, [hydrateExam, hydrateProjects])

  if (!examReady || !projectsReady) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading Study Lab…
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="exam" element={<ExamPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:slug" element={<ProjectDetailPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
