export interface SubnetResult {
  network: string
  broadcast: string
  first: string
  last: string
  mask: string
  wildcard: string
  hosts: string
  block: string
}

export function ipnum(input: string): number {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(input.trim())
  if (!match || match.slice(1).some((v) => Number(v) > 255)) {
    throw new Error('Enter a valid IPv4 address')
  }
  return match.slice(1).reduce((n, v) => ((n * 256) + Number(v)) >>> 0, 0)
}

export function ipstr(n: number): string {
  const value = n >>> 0
  return [
    value >>> 24,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join('.')
}

export function subnet(ip: string, prefix: number): SubnetResult {
  const n = ipnum(ip)
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const net = (n & mask) >>> 0
  const broad = (net | (~mask >>> 0)) >>> 0
  const total = 2 ** (32 - prefix)
  const usable = prefix === 32 ? 1 : prefix === 31 ? 2 : total - 2

  return {
    network: ipstr(net),
    broadcast: prefix >= 31 ? 'N/A for /31–/32' : ipstr(broad),
    first: ipstr(prefix >= 31 ? net : net + 1),
    last: ipstr(prefix >= 31 ? broad : broad - 1),
    mask: ipstr(mask),
    wildcard: ipstr((~mask) >>> 0),
    hosts: String(usable),
    block: String(total),
  }
}
