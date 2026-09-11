import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STUDENTS_API_URL = 'https://lynxtechmedia.com/ronaldstech/smis-api/v1/students.php'
const forms = [1, 2, 3, 4]

function App() {
  const [selectedForm, setSelectedForm] = useState('')
  const [students, setStudents] = useState([])
  const [searchName, setSearchName] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredStudents = useMemo(() => {
    const search = searchName.trim().toLowerCase()
    return students.filter((student) => student.name.toLowerCase().includes(search))
  }, [students, searchName])

  useEffect(() => {
    if (!selectedForm) return undefined

    const controller = new AbortController()

    fetch(`${STUDENTS_API_URL}?form=${selectedForm}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load students')
        return response.json()
      })
      .then((result) => {
        if (!result.status || !Array.isArray(result.data)) {
          throw new Error(result.message || 'The student list is unavailable')
        }
        setStudents(result.data)
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setStudents([])
          setError('Students could not be loaded. Please try again.')
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [selectedForm])

  const handleFormChange = (event) => {
    const form = event.target.value
    setSelectedForm(form)
    setStudents([])
    setSearchName('')
    setSelectedStudent(null)
    setError('')
    setLoading(Boolean(form))
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
    setSearchName(student.name)
  }

  return (
    <main className="portal-shell">
      <header className="portal-header">
        <div className="brand-mark">SMIS</div>
        <div>
          <p className="eyebrow">Student records</p>
          <h1>Results portal</h1>
        </div>
        <span className="header-tag">Academic year 2026</span>
      </header>

      <section className="portal-content">
        <div className="selector-layout">
            <div className="intro-copy">
              <p className="eyebrow">Find your academic record</p>
              <h2>Your results, one selection away.</h2>
              <p className="supporting-copy">Choose your class, then search for your name to view the correct student record.</p>
              <div className="stat-strip"><strong>{selectedForm ? students.length : '04'}</strong><span>{selectedForm ? `students in Form ${selectedForm}` : 'forms available to search'}</span></div>
            </div>
            <div className="selector-panel">
              <div className="step-heading"><span>01</span><div><p className="eyebrow">Start here</p><h3>Select your class</h3></div></div>
              <label htmlFor="form-select">Class</label>
              <select id="form-select" value={selectedForm} onChange={handleFormChange}>
                <option value="">Choose a form</option>
                {forms.map((form) => <option key={form} value={form}>Form {form}</option>)}
              </select>
              <div className={`search-wrap ${!selectedForm ? 'is-disabled' : ''}`}>
                <label htmlFor="student-search">02 &nbsp; Search your name</label>
                <input id="student-search" value={searchName} onChange={(event) => { setSearchName(event.target.value); setSelectedStudent(null) }} placeholder={selectedForm ? 'Type your name...' : 'Select a class first'} disabled={!selectedForm || loading} />
              </div>
              {loading && <p className="loading-state">Loading students from Form {selectedForm}...</p>}
              {error && <p className="error-message" role="alert">{error}</p>}
              {selectedForm && !loading && !error && <div className="student-list" role="listbox" aria-label="Students matching your search">
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <button className={`student-option ${selectedStudent?.id === student.id ? 'is-selected' : ''}`} type="button" key={student.id} onClick={() => handleStudentSelect(student)}>
                    <span className="avatar">{student.name.charAt(0)}</span><span><strong>{student.name}</strong><small>{student.student_reg}</small></span><span className="arrow">-&gt;</span>
                  </button>
                )) : <p className="empty-state">No student found in {selectedForm}.</p>}
              </div>}
            </div>
          </div>
        {selectedStudent && <div className="selected-record">
              <div className="record-label"><span className="check">✓</span><div><p className="eyebrow">Student selected</p><h3>{selectedStudent.name}</h3><p className="supporting-copy">{selectedStudent.student_reg} | Form {selectedStudent.form}</p></div></div>
              <div>
                <button className="primary-button" type="button">View results</button>
              </div>
            </div>}
      </section>
      <footer>Student Management Information System <span>|</span> Student results portal</footer>
    </main>
  )
}

export default App
