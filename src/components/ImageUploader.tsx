'use client'

import { useI18n } from '@/lib/i18n/context'
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
  const { t } = useI18n()
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
        className="upload-zone group flex cursor-pointer flex-col items-center justify-center gap-4 px-5 py-12 transition-all duration-300"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="max-h-52 w-full max-w-xs rounded-xl object-cover"
            style={{
              boxShadow: 'var(--shadow-elevated)',
            }}
          />
        ) : (
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl transition-all duration-300 group-hover:scale-110 bg-[var(--color-surface-container-high)] text-[var(--color-secondary)]"
            aria-hidden
          >
            <span className="material-symbols-outlined text-3xl">photo_camera</span>
          </span>
        )}
        <span className="text-center font-semibold text-[var(--ink)]">
          {label}
        </span>
        <span className="text-sm text-[var(--muted-soft)]">Camera ya gallery</span>
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
          {t('image.clear')}
        </button>
      )}
    </div>
  )
}
