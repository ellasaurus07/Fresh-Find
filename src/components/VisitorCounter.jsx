import useVisitorCounter from '../hooks/useVisitorCounter.js'
export default function VisitorCounter() {
  const count = useVisitorCounter()
  if (count == null) return null
  return (
    <p className="visitors" title="Simulated counter kept in this browser">
      <span aria-hidden="true">🌱</span> {count.toLocaleString()} <span>visits</span>
    </p>
  )
}
