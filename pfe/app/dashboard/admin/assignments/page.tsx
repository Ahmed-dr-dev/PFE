'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([
    {
      id: '1',
      student: {
        id: '1',
        name: 'Abdelrahman Ali',
        email: 'abdelrahman.ali@student.isaeg.ma',
        department: 'Informatique',
      },
      topic: {
        id: '1',
        title: 'Système de gestion de bibliothèque',
        professor: 'Prof. Ahmed Benali',
      },
      status: 'pending',
    },
    {
      id: '2',
      student: {
        id: '2',
        name: 'Fatima Zahra',
        email: 'fatima.zahra@student.isaeg.ma',
        department: 'Informatique',
      },
      topic: {
        id: '2',
        title: 'Plateforme e-learning',
        professor: 'Prof. Fatima Zahra',
      },
      status: 'pending',
    },
  ])

  const handleAssign = (assignmentId: string) => {
    setAssignments(assignments.map(a => a.id === assignmentId ? { ...a, status: 'assigned' } : a))
  }

  const pendingAssignments = assignments.filter(a => a.status === 'pending')
  const assigned = assignments.filter(a => a.status === 'assigned')

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Affectations</span>
          </h1>
          <p className="text-gray-400 text-lg">Affectez les encadrants aux étudiants</p>
        </div>
      </div>

      {pendingAssignments.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">En attente d'affectation ({pendingAssignments.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Étudiant</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                        {assignment.student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{assignment.student.name}</p>
                        <p className="text-gray-400 text-sm">{assignment.student.email}</p>
                        <p className="text-gray-500 text-xs mt-1">{assignment.student.department}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sujet & Encadrant</h3>
                    <div>
                      <p className="text-white font-semibold mb-1">{assignment.topic.title}</p>
                      <p className="text-gray-400 text-sm">{assignment.topic.professor}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => handleAssign(assignment.id)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25"
                  >
                    Confirmer l'affectation
                  </button>
                  <Link
                    href={`/dashboard/admin/assignments/${assignment.id}`}
                    className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {assigned.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Affectations confirmées ({assigned.length})</h2>
          <div className="grid grid-cols-1 gap-6">
            {assigned.map((assignment) => (
              <div
                key={assignment.id}
                className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Étudiant</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                        {assignment.student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{assignment.student.name}</p>
                        <p className="text-gray-400 text-sm">{assignment.student.email}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sujet & Encadrant</h3>
                    <div>
                      <p className="text-white font-semibold mb-1">{assignment.topic.title}</p>
                      <p className="text-gray-400 text-sm">{assignment.topic.professor}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingAssignments.length === 0 && assigned.length === 0 && (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 shadow-xl text-center">
          <p className="text-gray-400 text-lg">Aucune affectation en attente</p>
        </div>
      )}
    </div>
  )
}

