'use client'

import { useCallback, useId, useState, type ChangeEvent } from 'react'

type Props = {
  label: string
  accept?: string
  onFile: (_f: File | null) => void
  capture?: 'environment' | 'user'
}

export function ImageUploader({
  label,
  accept = 'image/*',
  onFile,
  capture,
}: Props) {
  const id = useId()
  const [preview, setPreview] = useState<string | null>(null)

  const clear = useCallback(() => {
    setPreview(null)
    onFile(null)
  }, [onFile])

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (!f) {
        clear()
        return
      }
      onFile(f)
      const url = URL.createObjectURL(f)
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    },
    [clear, onFile],
  )

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={id}
        className="raasta-card flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-[var(--raasta-border)] px-4 py-10 transition hover:border-[var(--chinar-amber)] hover:bg-[var(--chinar-mist)]"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="max-h-48 w-full max-w-xs rounded-lg object-cover shadow-md"
          />
        ) : (
          <span className="text-4xl" aria-hidden>
            📷
          </span>
        )}
        <span className="text-center font-medium text-[var(--raasta-ink)]">
          {label}
        </span>
        <span className="text-sm text-[var(--raasta-muted)]">
          Camera ya gallery
        </span>
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        capture={capture}
        className="sr-only"
        onChange={onChange}
      />
      {preview && (
        <button type="button" className="raasta-ghost text-sm" onClick={clear}>
          Photo hata dein
        </button>
      )}
    </div>
  )
}
