import { useEffect, useMemo, useState } from 'react'
import { fetchStudents } from '../api/students'

export function useStudentDirectory(selectedSchool, selectedForm) {
  const [students, setStudents] = useState([])
  const [searchName, setSearchName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredStudents = useMemo(() => {
    const search = searchName.trim().toLowerCase()
    return students.filter((student) => student.name.toLowerCase().includes(search))
  }, [students, searchName])

  useEffect(() => {
    if (!selectedSchool || !selectedForm) return undefined

    const controller = new AbortController()
    fetchStudents(selectedForm, selectedSchool, controller.signal)
      .then(setStudents)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setStudents([])
          setError('Students could not be loaded. Please try again.')
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [selectedSchool, selectedForm])

  const resetDirectory = (form = selectedForm) => {
    setStudents([])
    setSearchName('')
    setError('')
    setLoading(Boolean(form))
  }

  return {
    students,
    searchName,
    setSearchName,
    filteredStudents,
    loading,
    error,
    setError,
    resetDirectory,
  }
}
