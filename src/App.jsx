import { useState } from 'react'
import { fetchStudentResult } from './api/results'
import PortalFooter from './components/PortalFooter'
import PortalHeader from './components/PortalHeader'
import ResultsPanel from './components/ResultsPanel'
import SelectedStudent from './components/SelectedStudent'
import StudentPicker from './components/StudentPicker'
import { useStudentDirectory } from './hooks/useStudentDirectory'
import './App.css'

const forms = [1, 2, 3, 4]

function App() {
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedForm, setSelectedForm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [resultData, setResultData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const directory = useStudentDirectory(selectedSchool, selectedForm)

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value)
    setSelectedForm('')
    setSelectedStudent(null)
    setResultData(null)
    directory.resetDirectory('')
  }

  const handleFormChange = (event) => {
    const form = event.target.value
    setSelectedForm(form)
    setSelectedStudent(null)
    setResultData(null)
    directory.resetDirectory(form)
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
    directory.setSearchName(student.name)
    setResultData(null)
  }

  const viewResults = async () => {
    if (!selectedStudent) return

    directory.setError('')
    setReportLoading(true)
    try {
      setResultData(await fetchStudentResult(selectedStudent.id))
    } catch (requestError) {
      directory.setError(requestError.message || 'Unable to open this report.')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <main className="portal-shell">
      <PortalHeader />

      <section className="portal-content">
        <StudentPicker selectedSchool={selectedSchool} selectedForm={selectedForm} selectedStudent={selectedStudent} forms={forms} {...directory} onSchoolChange={handleSchoolChange} onFormChange={handleFormChange} onSearchChange={(event) => { directory.setSearchName(event.target.value); setSelectedStudent(null) }} onStudentSelect={handleStudentSelect} />
        {selectedStudent && <SelectedStudent student={selectedStudent} loading={reportLoading} onViewResults={viewResults} />}
        {resultData && <ResultsPanel result={resultData} />}
      </section>
      <PortalFooter />
    </main>
  )
}

export default App
