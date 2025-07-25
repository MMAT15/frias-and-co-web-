import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 rounded bg-primary text-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-dark',
        className
      )}
    />
  );
}
