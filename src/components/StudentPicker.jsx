export default function StudentPicker({
  selectedForm,
  selectedSchool,
  forms,
  students,
  selectedStudent,
  searchName,
  filteredStudents,
  loading,
  error,
  onFormChange,
  onSchoolChange,
  onSearchChange,
  onStudentSelect,
}) {
  return (
    <div className="selector-layout">
      <div className="intro-copy">
        <p className="eyebrow">Find your academic record</p>
        <h2>Your progress, <em>clearly seen.</em></h2>
        <p className="supporting-copy">Choose your school and class, then find your name to access your latest academic record securely.</p>
        <div className="trust-row"><span className="trust-icon">&#10003;</span><span>Private, student-specific academic records</span></div>
        <div className="stat-strip"><strong>{selectedForm ? students.length : '04'}</strong><span>{selectedForm ? `students in Form ${selectedForm}` : 'forms available to search'}</span></div>
      </div>
      <div className="selector-panel">
        <div className="progress-steps" aria-label="Record lookup progress">
          <span className={selectedSchool ? 'is-complete' : 'is-current'}>School</span>
          <span className={selectedForm ? 'is-complete' : ''}>Class</span>
          <span className={selectedStudent ? 'is-complete' : ''}>Record</span>
        </div>
        <div className="step-heading"><span>01</span><div><p className="eyebrow">Start here</p><h3>Find your student record</h3></div></div>
        <label htmlFor="school-select">School</label>
        <select id="school-select" data-tour="school" value={selectedSchool} onChange={onSchoolChange}>
          <option value="">Choose a school</option>
          <option value="day">Day school</option>
          <option value="open">Open school</option>
        </select>
        <label htmlFor="form-select">Class</label>
        <select id="form-select" data-tour="form" value={selectedForm} onChange={onFormChange} disabled={!selectedSchool}>
          <option value="">Choose a form</option>
          {forms.map((form) => <option key={form} value={form}>Form {form}</option>)}
        </select>
        <div className={`search-wrap ${!selectedForm ? 'is-disabled' : ''}`}>
          <label htmlFor="student-search">Step 02 &nbsp; Search your name</label>
          <input id="student-search" data-tour="search" value={searchName} onChange={onSearchChange} placeholder={selectedForm ? 'Type your name...' : 'Select a class first'} disabled={!selectedForm || loading} />
        </div>
        {loading && <div className="loading-state" role="status" aria-live="polite">
          <div className="loading-topline"><span className="loading-spinner" aria-hidden="true"></span><strong>Preparing your class list</strong><span className="loading-dots" aria-hidden="true">...</span></div>
          <p>Finding {selectedSchool} school students in Form {selectedForm}</p>
          <div className="loading-track" aria-hidden="true"><span></span></div>
        </div>}
        {error && <p className="error-message" role="alert">{error}</p>}
        {selectedForm && !loading && !error && <div className="student-list" role="listbox" aria-label="Students matching your search">
          {filteredStudents.length > 0 ? filteredStudents.map((student) => (
            <button className={`student-option ${selectedStudent?.id === student.id ? 'is-selected' : ''}`} type="button" key={student.id} onClick={() => onStudentSelect(student)}>
              <span className="avatar">{student.name.charAt(0)}</span><span><strong>{student.name}</strong><small>{student.student_reg}</small></span><span className="arrow">&rarr;</span>
            </button>
          )) : <p className="empty-state">No student found in Form {selectedForm}.</p>}
        </div>}
      </div>
    </div>
  )
}
