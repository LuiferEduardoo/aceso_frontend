import { useEffect, useRef, type ComponentProps } from 'react'

interface BlobImageProps extends Omit<ComponentProps<'img'>, 'src'> {
  blob: Blob
}

/** Shows a Blob through a short-lived object URL that is revoked on change/unmount. */
export function BlobImage({ blob, alt, ...props }: BlobImageProps) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(blob)
    if (ref.current) ref.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [blob])

  return <img ref={ref} alt={alt} {...props} />
}
