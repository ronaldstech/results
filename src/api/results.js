const RESULTS_API_URL = 'https://lynxtechmedia.com/ronaldstech/smis-api/v1/results.php'

export async function fetchStudentResult(studentId) {
  const response = await fetch(`${RESULTS_API_URL}?student_id=${studentId}`)
  const result = await response.json().catch(() => ({}))

  if (!response.ok || !result.status || !result.data) {
    throw new Error(result.message || 'This student result is not available yet.')
  }

  return result.data
}
