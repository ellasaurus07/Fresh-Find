import { useId, useState } from 'react'
import { AREAS } from '../lib/data.js'
import { DAYS } from '../lib/schedule.js'
import { PRODUCE_FILTER_OPTIONS } from '../lib/filters.js'
import Icon from './Icon.jsx'

// SRS Home "Quick Find": Find a Market Near You — by area, day, or produce.
export function FilterSelects({ value, onChange, idBase, todayLabel = true }) {
  const today = new Date().getDay()
  return (
    <>
      <label className="field">
        <span>Area</span>
        <select id={`${idBase}-area`} value={value.area} onChange={(e) => onChange({ ...value, area: e.target.value })}>
          <option value="">Any area</option>
          {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Day</span>
        <select id={`${idBase}-day`} value={value.day} onChange={(e) => onChange({ ...value, day: e.target.value })}>
          <option value="">Any day</option>
          {DAYS.map((d, i) => <option key={d} value={String(i)}>{d}{todayLabel && i === today ? ' (today)' : ''}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Produce</span>
        <select id={`${idBase}-produce`} value={value.produce} onChange={(e) => onChange({ ...value, produce: e.target.value })}>
          <option value="">Anything</option>
          <optgroup label="Categories">
            {PRODUCE_FILTER_OPTIONS.slice(0, 5).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </optgroup>
          <optgroup label="Produce">
            {PRODUCE_FILTER_OPTIONS.slice(5).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </optgroup>
        </select>
      </label>
    </>
  )
}

export default function QuickFind({ onSubmit, onLocate, locating, className = '' }) {
  const id = useId()
  const [value, setValue] = useState({ area: '', day: '', produce: '' })
  return (
    <form
      className={`quickfind ${className}`}
      role="search"
      aria-labelledby={`${id}-t`}
      onSubmit={(e) => { e.preventDefault(); onSubmit(value) }}
    >
      <p id={`${id}-t`} className="quickfind__title"><Icon name="pin" size={18} /> Find a market near you</p>
      <div className="quickfind__row">
        <FilterSelects value={value} onChange={setValue} idBase={id} />
        <button type="submit" className="btn btn--primary quickfind__go" data-cursor="open">
          <Icon name="search" size={18} /><span>Find markets</span>
        </button>
      </div>
      {onLocate && (
        <button type="button" className="text-btn quickfind__locate" onClick={onLocate} disabled={locating}>
          <Icon name="locate" size={16} /> {locating ? 'Finding you…' : 'Or use my location'}
        </button>
      )}
    </form>
  )
}
