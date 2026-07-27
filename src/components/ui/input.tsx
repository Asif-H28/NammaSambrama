import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('input', className)} {...props} />
}

export { Input }
