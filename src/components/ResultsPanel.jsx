export default function ResultsPanel({ result, pdfLoading, onDownloadPdf }) {
  const decision = result.summary.decision.toLowerCase()

  return (
    <section className="results-panel" aria-live="polite">
        <header className="report-school-header">
          <div className="report-school-mark">SMIS</div>
          <div className="report-school-info">
            <p className="eyebrow">Official student report</p>
            <strong>{result.school?.name || result.student.school}</strong>
            {(result.school?.address || result.school?.phone) && <span>{[result.school?.address, result.school?.phone].filter(Boolean).join(' / ')}</span>}
          </div>
        </header>

        <div className={`decision-banner ${decision}`}>
          <span>Academic decision</span>
          <strong>{result.summary.decision}</strong>
          <small>{decision === 'pass' ? 'Congratulations on your progress.' : 'Please speak with your school for guidance.'}</small>
        </div>

        <div className="results-heading">
          <div>
            <p className="eyebrow">Academic result</p>
            <h2 id="results-title">{result.student.name}</h2>
            <p className="supporting-copy">{result.academic.name} / Term {result.academic.term} / Form {result.student.form}</p>
            {result.school?.motto && <p className="school-motto">{result.school.motto}</p>}
          </div>
          <button className="download-button" type="button" onClick={onDownloadPdf} disabled={pdfLoading}>
            <span aria-hidden="true">&#8595;</span>{pdfLoading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>

        <div className="summary-grid">
          <div><span>{result.summary.label}</span><strong>{result.summary.total}</strong></div>
          <div><span>Class position</span><strong>{result.summary.position}/{result.summary.class_size}</strong></div>
        </div>

        <div className="results-table-wrap"><table><thead><tr><th>Subject</th><th>Final</th><th>Grade</th><th>Position</th><th>Remark</th><th>Teacher</th></tr></thead><tbody>
          {result.subjects.map((subject) => <tr key={subject.subject}><td data-label="Subject">{subject.subject}</td><td data-label="Final">{subject.final ?? '-'}</td><td data-label="Grade">{subject.grade ?? '-'}</td><td data-label="Position">{subject.position ?? '-'}</td><td data-label="Remark">{subject.remark || '-'}</td><td data-label="Teacher">{subject.teacher || '-'}</td></tr>)}
        </tbody></table></div>

        <div className="remarks-grid">
          <div><p className="eyebrow">Form teacher's remarks</p><p>{result.remarks?.teacher || 'No remark available.'}</p></div>
          <div><p className="eyebrow">Headteacher's remarks</p><p>{result.remarks?.head || 'No remark available.'}</p></div>
        </div>
    </section>
  )
}
