import { AlertCircle, Database } from 'lucide-react'

interface ConnectionBannerProps {
  message: string
}

export function ConnectionBanner({ message }: ConnectionBannerProps) {
  return (
    <div className="flex items-center gap-3 bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="flex items-center gap-2 text-amber-500">
        <Database className="h-4 w-4" />
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-amber-200">
          <span className="font-medium">Modo Demo:</span>{' '}
          <span className="text-amber-300/80">{message}</span>
        </p>
      </div>
      <a
        href="https://vercel.com/docs/environment-variables"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
      >
        Ver documentación
      </a>
    </div>
  )
}
