export default function ResultsPanel({ result }) {
  return (
    <section className="results-panel" aria-live="polite">
      <div className="results-heading">
        <div>
          <p className="eyebrow">Academic result</p>
          <h2>{result.student.name}</h2>
          <p className="supporting-copy">{result.academic.name} | Term {result.academic.term} | Form {result.student.form} | {result.student.school}</p>
          {result.school?.motto && <p className="school-motto">{result.school.motto}</p>}
        </div>
        <span className={`decision ${result.summary.decision.toLowerCase()}`}>{result.summary.decision}</span>
      </div>
      <div className="summary-grid">
        <div><span>{result.summary.label}</span><strong>{result.summary.total}</strong></div>
        <div><span>Class position</span><strong>{result.summary.position} <small>of {result.summary.class_size}</small></strong></div>
      </div>
      <div className="results-table-wrap"><table><thead><tr><th>Subject</th><th>Final</th><th>Grade</th><th>Position</th><th>Remark</th><th>Teacher</th></tr></thead><tbody>
        {result.subjects.map((subject) => <tr key={subject.subject}><td>{subject.subject}</td><td>{subject.final ?? '-'}</td><td>{subject.grade ?? '-'}</td><td>{subject.position ?? '-'}</td><td>{subject.remark || '-'}</td><td>{subject.teacher || '-'}</td></tr>)}
      </tbody></table></div>
      <div className="remarks-grid">
        <div><p className="eyebrow">Form teacher's remarks</p><p>{result.remarks?.teacher || 'No remark available.'}</p></div>
        <div><p className="eyebrow">Headteacher's remarks</p><p>{result.remarks?.head || 'No remark available.'}</p></div>
      </div>
      {(result.school || result.banking || result.requirements) && <div className="details-grid">
        {result.school && <div><p className="eyebrow">School</p><strong>{result.school.name}</strong><span>{result.school.address}</span><span>{result.school.phone}</span>{result.headteacher && <span>Headteacher: {result.headteacher}</span>}</div>}
        {result.banking && <div><p className="eyebrow">Fees and banking</p><strong>{result.banking.account_name || 'Bank details unavailable'}</strong><span>{result.banking.bank} {result.banking.account_no && `| ${result.banking.account_no}`}</span><span>{result.banking.center} {result.banking.branch && `| ${result.banking.branch}`}</span></div>}
        {result.requirements && <div><p className="eyebrow">Next term requirements</p><strong>Fees: K{result.requirements.fees ?? '-'}</strong><span>{result.requirements.items}</span></div>}
      </div>}
    </section>
  )
}
