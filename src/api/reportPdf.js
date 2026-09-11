const REPORT_PDF_API_URL = 'https://lynxtechmedia.com/ronaldstech/smis-api/v1/student_report_pdf.php'

export async function downloadStudentReport(studentId, registration) {
  const response = await fetch(`${REPORT_PDF_API_URL}?student_id=${studentId}`)
  const contentType = response.headers.get('content-type') || ''

  if (!response.ok || !contentType.includes('application/pdf')) {
    const result = await response.json().catch(() => ({}))
    throw new Error(result.message || 'The PDF report is not available yet.')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Student_Report_${registration.replace(/[^A-Za-z0-9_-]/g, '_')}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
