export default function SelectedStudent({ student, loading, onViewResults }) {
  return (
    <div className="selected-record">
      <div className="record-label"><span className="check">&#10003;</span><div><p className="eyebrow">Student selected</p><h3>{student.name}</h3><p className="supporting-copy">{student.student_reg} | Form {student.form}</p></div></div>
      <div>
        <button className="primary-button" type="button" onClick={onViewResults} disabled={loading}>{loading ? 'Loading results...' : 'View results'}</button>
      </div>
    </div>
  )
}
