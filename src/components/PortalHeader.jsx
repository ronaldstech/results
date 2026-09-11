export default function PortalHeader({ selectedSchool, schoolName: returnedSchoolName, onStartTour }) {
  const schoolName = returnedSchoolName || (selectedSchool === 'day' ? 'Day school' : selectedSchool === 'open' ? 'Open school' : 'School results')

  return (
    <header className="portal-header">
      <div className="brand-mark">SMIS</div>
      <div>
        <p className="eyebrow">Student records</p>
        <h1>Results portal</h1>
        <p className="school-context">{schoolName}</p>
      </div>
      <span className="header-tag">Academic year 2026</span>
      <button className="tour-trigger" type="button" onClick={onStartTour}><span aria-hidden="true">?</span> Tour guide</button>
    </header>
  )
}
