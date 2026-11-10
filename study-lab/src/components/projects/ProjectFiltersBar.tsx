import { SAMPLE_PROJECTS } from '@/data/projects'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProjectStore } from '@/store/project-store'
import type { CareerTrack, ProjectDifficulty } from '@/types/project'

const careers: { value: CareerTrack | 'all'; label: string }[] = [
  { value: 'all', label: 'All careers' },
  { value: 'network-engineer', label: 'Network Engineer' },
  { value: 'system-administrator', label: 'System Administrator' },
  { value: 'cloud-engineer', label: 'Cloud Engineer' },
  { value: 'platform-engineer', label: 'Platform Engineer' },
  { value: 'devops-engineer', label: 'DevOps Engineer' },
  { value: 'cybersecurity-engineer', label: 'Cybersecurity Engineer' },
  { value: 'cloud-solutions-architect', label: 'Cloud Solutions Architect' },
]

export function ProjectFiltersBar() {
  const filters = useProjectStore((s) => s.filters)
  const setFilters = useProjectStore((s) => s.setFilters)

  const certifications = ['all', ...new Set(SAMPLE_PROJECTS.map((p) => p.certification))]
  const technologies = ['all', ...new Set(SAMPLE_PROJECTS.flatMap((p) => p.technologies))]
  const software = ['all', ...new Set(SAMPLE_PROJECTS.flatMap((p) => p.requiredSoftware))]

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-3 lg:grid-cols-4">
      <div className="md:col-span-2 lg:col-span-2">
        <Label htmlFor="project-search">Search</Label>
        <Input
          id="project-search"
          placeholder="Title, tech, software, objective (N10-009), domain…"
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
        />
      </div>
      <FilterSelect
        label="Certification"
        value={filters.certification}
        options={certifications.map((c) => ({ value: c, label: c === 'all' ? 'All certs' : c }))}
        onChange={(v) => setFilters({ certification: v })}
      />
      <FilterSelect
        label="Difficulty"
        value={filters.difficulty}
        options={[
          { value: 'all', label: 'All levels' },
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ]}
        onChange={(v) => setFilters({ difficulty: v as ProjectDifficulty | 'all' })}
      />
      <FilterSelect
        label="Technology"
        value={filters.technology}
        options={technologies.map((t) => ({ value: t, label: t === 'all' ? 'All tech' : t }))}
        onChange={(v) => setFilters({ technology: v })}
      />
      <FilterSelect
        label="Required software"
        value={filters.requiredSoftware}
        options={software.map((t) => ({ value: t, label: t === 'all' ? 'All apps' : t }))}
        onChange={(v) => setFilters({ requiredSoftware: v })}
      />
      <FilterSelect
        label="Career track"
        value={filters.careerTrack}
        options={careers}
        onChange={(v) => setFilters({ careerTrack: v as CareerTrack | 'all' })}
      />
      <div>
        <Label htmlFor="max-hours">Max hours</Label>
        <Input
          id="max-hours"
          type="number"
          min={1}
          placeholder="Any"
          value={filters.maxHours ?? ''}
          onChange={(e) =>
            setFilters({ maxHours: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        className="mt-0 h-10 w-full rounded-md border border-border bg-[#10213a] px-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
