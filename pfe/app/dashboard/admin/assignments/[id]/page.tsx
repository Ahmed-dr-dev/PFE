'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const [assignment, setAssignment] = useState({
    id: params.id,
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
  })

  const professors = [
    { id: '1', name: 'Prof. Ahmed Benali', department: 'Informatique' },
    { id: '2', name: 'Prof. Fatima Zahra', department: 'Informatique' },
    { id: '3', name: 'Prof. Mohamed Amine', department: 'Gestion' },
  ]

  const handleAssign = () => {
    setAssignment({ ...assignment, status: 'assigned' })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/assignments"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux affectations
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Affectation <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">encadrant</span>
          </h1>
          <p className="text-gray-400 text-lg">Affectez un encadrant à l'étudiant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Étudiant</h2>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-xl">
                {assignment.student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{assignment.student.name}</h3>
                <p className="text-gray-400 text-sm">{assignment.student.email}</p>
                <p className="text-gray-500 text-xs mt-1">{assignment.student.department}</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Sujet de PFE</h2>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{assignment.topic.title}</h3>
              <p className="text-gray-400 text-sm">Encadrant actuel: {assignment.topic.professor}</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Sélectionner un encadrant</h2>
            <div className="space-y-3">
              {professors.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => setAssignment({
                    ...assignment,
                    topic: { ...assignment.topic, professor: prof.name }
                  })}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                    assignment.topic.professor === prof.name
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'bg-slate-700/30 border-slate-600/50 hover:border-emerald-500/50'
                  }`}
                >
                  <h3 className="text-white font-semibold mb-1">{prof.name}</h3>
                  <p className="text-gray-400 text-sm">{prof.department}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Résumé</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Étudiant</p>
                <p className="text-white font-medium text-sm">{assignment.student.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sujet</p>
                <p className="text-white font-medium text-sm">{assignment.topic.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Encadrant</p>
                <p className="text-white font-medium text-sm">{assignment.topic.professor}</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleAssign}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm"
              >
                Confirmer l'affectation
              </button>
              <Link
                href="/dashboard/admin/assignments"
                className="block w-full px-4 py-3 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold text-sm text-center"
              >
                Annuler
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

