const STUDENTS_API_URL = 'https://lynxtechmedia.com/ronaldstech/smis-api/v1/students.php'

export async function fetchStudents(form, school, signal) {
  const response = await fetch(`${STUDENTS_API_URL}?form=${form}&school=${school}`, { signal })
  if (!response.ok) throw new Error('Unable to load students')

  const result = await response.json()
  if (!result.status || !Array.isArray(result.data)) {
    throw new Error(result.message || 'The student list is unavailable')
  }

  return result.data
}
