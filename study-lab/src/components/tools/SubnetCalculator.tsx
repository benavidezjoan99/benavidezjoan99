import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { subnet, type SubnetResult } from '@/lib/subnet'

export function SubnetCalculator() {
  const [ip, setIp] = useState('192.168.1.67')
  const [cidr, setCidr] = useState(26)
  const [result, setResult] = useState<SubnetResult | null>(() => {
    try {
      return subnet('192.168.1.67', 26)
    } catch {
      return null
    }
  })
  const [error, setError] = useState<string | null>(null)

  const options = useMemo(() => Array.from({ length: 33 }, (_, i) => i), [])

  function calculate() {
    try {
      setResult(subnet(ip, cidr))
      setError(null)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Invalid input')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subnetting calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
          <div>
            <Label htmlFor="ipcalc">IPv4 address</Label>
            <Input
              id="ipcalc"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && calculate()}
            />
          </div>
          <div>
            <Label htmlFor="cidrcalc">Prefix</Label>
            <select
              id="cidrcalc"
              className="mt-0 h-10 w-full rounded-md border border-border bg-[#10213a] px-2"
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
            >
              {options.map((p) => (
                <option key={p} value={p}>
                  /{p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={calculate}>Calculate</Button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <dl className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ['Network', result.network],
                ['Subnet mask', result.mask],
                ['Broadcast', result.broadcast],
                ['First usable', result.first],
                ['Last usable', result.last],
                ['Usable hosts', result.hosts],
                ['Block size', result.block],
                ['Wildcard mask', result.wildcard],
              ] as const
            ).map(([name, val]) => (
              <div key={name} className="rounded-md border border-border bg-[#0b1e33] px-3 py-2">
                <dt className="text-xs text-muted-foreground">{name}</dt>
                <dd className="font-mono text-sm">{val}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
