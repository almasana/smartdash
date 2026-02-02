import { DashboardContent } from '@/components/dashboard-content'
import {
  getRiskSignals,
  getGlobalRiskScore,
  getCapitalMetrics,
  getChatMessages,
  checkDatabaseConnection,
} from '@/lib/actions'

export default async function SmartDashboard() {
  // Fetch initial data on the server
  const [signals, score, metrics, messages, connectionStatus] = await Promise.all([
    getRiskSignals('all'),
    getGlobalRiskScore(),
    getCapitalMetrics(),
    getChatMessages(),
    checkDatabaseConnection(),
  ])

  return (
    <DashboardContent
      initialSignals={signals}
      initialScore={score}
      initialMetrics={metrics}
      initialMessages={messages}
      initialConnectionStatus={connectionStatus}
    />
  )
}
