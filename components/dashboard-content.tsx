"use client"

import { useState, useEffect, useTransition } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { RiskScoreCard } from "@/components/risk-score-card"
import { RiskTable } from "@/components/risk-table"
import { WhatsAppChat } from "@/components/whatsapp-chat"
import { MitigationWizard } from "@/components/mitigation-wizard"
import { AdminAlert } from "@/components/admin-alert"
import { filterByRubro, markAsRead } from "@/lib/actions"
import { checkRiskDataHealth, HealthStatus } from "@/lib/services/health-check.service"

export function DashboardContent({ initialData }: any) {
  const [selectedRubro, setSelectedRubro] = useState("Todos los rubros")
  const [riskData, setRiskData] = useState(initialData)
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([])
  const [isPending, startTransition] = useTransition()

  // --- Carga de Health Check
  useEffect(() => {
    startTransition(async () => {
      const status = await checkRiskDataHealth(selectedRubro)
      setHealthStatus(status)
    })
  }, [selectedRubro])

  const handleRubroChange = (rubro: string) => {
    setSelectedRubro(rubro)
    startTransition(async () => {
      const result = await filterByRubro(rubro)
      if (result) setRiskData(result)
      const status = await checkRiskDataHealth(rubro)
      setHealthStatus(status)
    })
  }

  const handleMarkAsRead = async (id: string) => {
    const updatedData = await markAsRead(id, selectedRubro)
    if (updatedData) setRiskData(updatedData)
  }

  const handleSendMessage = async (content: string) => {
    console.log("Enviando sugerencia de IA a WhatsApp:", content)
    // Integración futura con acción real de Fase 4
  }

  const isAIBlocked = healthStatus.some(h => !h.healthy)
  const allIssues = healthStatus.flatMap(h => h.issues)

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader selectedRubro={selectedRubro} onRubroChange={handleRubroChange} />

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-[1600px] space-y-8">

              {/* Score y Wizard AI */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-7">
                  <RiskScoreCard evaluation={riskData.globalScore} metrics={riskData.capitalMetrics} />
                </div>
                <div className="xl:col-span-5">
                  <MitigationWizard 
                    plan={riskData.aiPlan} 
                    onSendMessage={handleSendMessage} 
                    disabled={isAIBlocked}
                  />
                  {isAIBlocked && <AdminAlert issues={allIssues} />}
                </div>
              </div>

              {/* Data y Comunicaciones */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <RiskTable signals={riskData.signals} />
                </div>
                <div className="lg:col-span-4">
                  <div className="h-full min-h-[500px] rounded-xl border border-border bg-card overflow-hidden">
                    <WhatsAppChat 
                      messages={riskData.messages} 
                      onMarkAsRead={handleMarkAsRead} 
                    />
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
