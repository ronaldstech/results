export default function SelectedStudent({ student, loading, onViewResults, onChangeStudent, onClose }) {
  return (
    <div className="student-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="student-modal" role="dialog" aria-modal="true" aria-labelledby="selected-student-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-modal" type="button" onClick={onClose} aria-label="Close student confirmation">&times;</button>
        <span className="check">&#10003;</span>
        <p className="eyebrow">Student selected</p>
        <h2 id="selected-student-title">{student.name}</h2>
        <p className="supporting-copy">{student.student_reg} | Form {student.form} | {student.school} school</p>
        <p className="modal-question">Is this the student whose result you want to view?</p>
        <div className="record-actions">
          <button className="secondary-button" type="button" onClick={onChangeStudent}>Change student</button>
          <button className="primary-button" type="button" onClick={onViewResults} disabled={loading}>{loading ? 'Loading results...' : <>View results <span aria-hidden="true">&rarr;</span></>}</button>
        </div>
      </section>
    </div>
  )
}
