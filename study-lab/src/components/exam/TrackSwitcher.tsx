import { TRACK_LABELS } from '@/data/banks'
import { useExamStore } from '@/store/exam-store'
import type { TrackId } from '@/types/exam'
import { cn } from '@/lib/utils'

export function TrackSwitcher() {
  const active = useExamStore((s) => s.store.active)
  const setTrack = useExamStore((s) => s.setTrack)

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(TRACK_LABELS) as TrackId[]).map((track) => (
        <button
          key={track}
          type="button"
          onClick={() => setTrack(track)}
          className={cn(
            'min-w-[155px] rounded-md border border-border bg-[#152741] px-3 py-2 text-left text-sm font-bold',
            active === track && 'border-[#5b9ee8] bg-[#20599c] text-white',
          )}
        >
          {TRACK_LABELS[track]}
          <small className="mt-0.5 block text-[0.7rem] font-medium opacity-75">
            {track === 'network' ? 'N10-009' : 'SY0-701'}
          </small>
        </button>
      ))}
    </div>
  )
}
