/** @jsx h */
import { h } from 'preact'
import { useState } from 'preact/hooks'

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial)

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        type="button"
        onClick={() => setCount((value) => value - 1)}
        aria-label="Decrease count"
      >
        −
      </button>
      <span>{count}</span>
      <button
        type="button"
        onClick={() => setCount((value) => value + 1)}
        aria-label="Increase count"
      >
        +
      </button>
    </div>
  )
}

export default Counter
