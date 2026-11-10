import { QuickMath } from '@/components/tools/QuickMath'
import { SubnetCalculator } from '@/components/tools/SubnetCalculator'

export function ToolsPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SubnetCalculator />
      <QuickMath />
    </div>
  )
}
