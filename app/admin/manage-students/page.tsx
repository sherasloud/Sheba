'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ManageStudentsPage() {
  const [institutions, setInstitutions] = useState<any[]>([])
  const [selectedInstitution, setSelectedInstitution] = useState<string>('')
  const [students, setStudents] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    roll: '',
    studentId: '',
    email: '',
    phone: '',
    class: '',
  })

  useEffect(() => {
    loadInstitutions()
  }, [])

  useEffect(() => {
    if (selectedInstitution) {
      loadStudents()
    }
  }, [selectedInstitution])

  const loadInstitutions = async () => {
    try {
      const response = await fetch('/api/education-institutions')
      if (response.ok) {
        const data = await response.json()
        setInstitutions(data.institutions || [])
      }
    } catch (error) {
      console.error('[v0] Error loading institutions:', error)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await fetch(`/api/students?institutionName=${encodeURIComponent(selectedInstitution)}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('[v0] Error loading students:', error)
    }
  }

  const handleAddStudent = async () => {
    if (!formData.name || !formData.roll || !formData.studentId) {
      alert('Please fill required fields (Name, Roll, Student ID)')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          institutionName: selectedInstitution,
        }),
      })

      if (response.ok) {
        setFormData({ name: '', roll: '', studentId: '', email: '', phone: '', class: '' })
        setShowForm(false)
        loadStudents()
      }
    } catch (error) {
      console.error('[v0] Error adding student:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async (index: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await fetch('/api/students', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index }),
        })
        loadStudents()
      } catch (error) {
        console.error('[v0] Error deleting student:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center sticky top-0 z-10">
        <Link href="/admin/manage-bill-donate" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Manage Students</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto max-w-2xl mx-auto w-full">
        {/* Institution Selector */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 sticky top-16 z-10">
          <label className="block text-sm font-semibold mb-2">Select Institution</label>
          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose Institution --</option>
            {institutions.map((inst, idx) => (
              <option key={idx} value={inst.name}>
                {inst.name} ({inst.type})
              </option>
            ))}
          </select>
        </div>

        {selectedInstitution && (
          <>
            {/* Add Student Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full mb-4 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-700"
            >
              <Plus size={20} /> Add Student
            </button>

            {/* Add Student Form */}
            {showForm && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <h3 className="font-semibold mb-3">Add New Student</h3>
                <input
                  type="text"
                  placeholder="Student Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Roll Number *"
                  value={formData.roll}
                  onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Student ID *"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Class"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddStudent}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700"
                  >
                    {loading ? 'Adding...' : 'Add Student'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Students List */}
            <div className="space-y-2 pb-4">
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No students added yet for {selectedInstitution}</p>
                </div>
              ) : (
                students.map((student, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <p className="text-sm text-gray-600">Roll: {student.roll}</p>
                        <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                        {student.class && <p className="text-sm text-gray-600">Class: {student.class}</p>}
                        {student.email && <p className="text-sm text-gray-600">Email: {student.email}</p>}
                        {student.phone && <p className="text-sm text-gray-600">Phone: {student.phone}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteStudent(index)}
                        className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
