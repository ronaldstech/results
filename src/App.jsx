import { useState } from 'react'
import { downloadStudentReport } from './api/reportPdf'
import { fetchStudentResult } from './api/results'
import PortalFooter from './components/PortalFooter'
import PortalHeader from './components/PortalHeader'
import ResultsPanel from './components/ResultsPanel'
import SelectedStudent from './components/SelectedStudent'
import StudentPicker from './components/StudentPicker'
import TourGuide from './components/TourGuide'
import { useStudentDirectory } from './hooks/useStudentDirectory'
import './App.css'

const forms = [1, 2, 3, 4]

function App() {
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedForm, setSelectedForm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [tourOpen, setTourOpen] = useState(() => localStorage.getItem('smis-tour-complete') !== 'true')
  const directory = useStudentDirectory(selectedSchool, selectedForm)

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value)
    setSelectedForm('')
    setSelectedStudent(null)
    setStudentModalOpen(false)
    setResultData(null)
    directory.resetDirectory('')
  }

  const handleFormChange = (event) => {
    const form = event.target.value
    setSelectedForm(form)
    setSelectedStudent(null)
    setStudentModalOpen(false)
    setResultData(null)
    directory.resetDirectory(form)
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
    setStudentModalOpen(true)
    directory.setSearchName(student.name)
    setResultData(null)
  }

  const viewResults = async () => {
    if (!selectedStudent) return

    directory.setError('')
    setReportLoading(true)
    try {
      setResultData(await fetchStudentResult(selectedStudent.id))
      setStudentModalOpen(false)
    } catch (requestError) {
      directory.setError(requestError.message || 'Unable to open this report.')
    } finally {
      setReportLoading(false)
    }
  }

  const chooseAnotherStudent = () => {
    setSelectedStudent(null)
    setStudentModalOpen(false)
    setResultData(null)
    directory.setSearchName('')
    window.requestAnimationFrame(() => document.getElementById('student-search')?.focus())
  }

  const downloadPdf = async () => {
    if (!selectedStudent) return

    directory.setError('')
    setPdfLoading(true)
    try {
      await downloadStudentReport(selectedStudent.id, selectedStudent.student_reg)
    } catch (requestError) {
      directory.setError(requestError.message || 'Unable to download this report.')
    } finally {
      setPdfLoading(false)
    }
  }

  const closeTour = () => {
    localStorage.setItem('smis-tour-complete', 'true')
    setTourOpen(false)
  }

  return (
    <main className="portal-shell">
      <PortalHeader selectedSchool={selectedSchool} schoolName={resultData?.school?.name} onStartTour={() => setTourOpen(true)} />

      <section className="portal-content">
        <StudentPicker selectedSchool={selectedSchool} selectedForm={selectedForm} selectedStudent={selectedStudent} forms={forms} {...directory} onSchoolChange={handleSchoolChange} onFormChange={handleFormChange} onSearchChange={(event) => { directory.setSearchName(event.target.value); setSelectedStudent(null) }} onStudentSelect={handleStudentSelect} />
        {selectedStudent && studentModalOpen && <SelectedStudent student={selectedStudent} loading={reportLoading} onViewResults={viewResults} onChangeStudent={chooseAnotherStudent} onClose={() => setStudentModalOpen(false)} />}
        {resultData && <ResultsPanel result={resultData} pdfLoading={pdfLoading} onDownloadPdf={downloadPdf} />}
      </section>
      <PortalFooter />
      <TourGuide open={tourOpen} onClose={closeTour} />
    </main>
  )
}

export default App
