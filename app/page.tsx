import { getInitialDashboardData } from '@/lib/actions';
import { DashboardContent } from '@/components/dashboard-content';
import { ALL_SEGMENTS } from '@/lib/domain/risk';

export default async function Page() {
  const data = await getInitialDashboardData();
  if (!data) return (
    <div className="h-screen flex items-center justify-center bg-[oklch(0.145_0_0)] text-[oklch(0.985_0_0)]">
      Sincronizando Riesgos...
    </div>
  );
  return <DashboardContent initialData={data} currentRubro={ALL_SEGMENTS} />;
}
