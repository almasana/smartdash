"use client"

interface AdminAlertProps {
  issues: string[]
}

export function AdminAlert({ issues }: AdminAlertProps) {
  if (!issues || issues.length === 0) return null

  return (
    <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
      <h4 className="font-semibold mb-1">⚠️ Alertas de Integridad</h4>
      <ul className="list-disc list-inside">
        {issues.map((issue, idx) => (
          <li key={idx}>{issue}</li>
        ))}
      </ul>
    </div>
  )
}
