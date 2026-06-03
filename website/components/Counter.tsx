import { useState } from 'preact/hooks'

export default function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial)

  return (
    <div class="pp-counter">
      <button
        type="button"
        onClick={() => setCount((value) => value - 1)}
        aria-label="Decrease count"
      >
        -
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
