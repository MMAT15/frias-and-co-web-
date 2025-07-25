import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    />
  );
}
