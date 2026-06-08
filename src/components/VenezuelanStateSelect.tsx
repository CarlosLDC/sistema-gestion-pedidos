'use client';

import { cn } from '../lib/utils';
import { VENEZUELAN_STATES, isVenezuelanState } from '../lib/venezuelanStates';

interface VenezuelanStateSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  accent?: 'primary' | 'secondary';
}

const focusAccentClass = {
  primary: 'focus:border-primary-500',
  secondary: 'focus:border-secondary-500',
};

export default function VenezuelanStateSelect({
  value,
  onChange,
  required,
  className,
  allowEmpty = false,
  emptyLabel = 'Seleccione un estado',
  accent = 'primary',
}: VenezuelanStateSelectProps) {
  return (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full bg-surface-950 border border-surface-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none',
        focusAccentClass[accent],
        className
      )}
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {value && !isVenezuelanState(value) && <option value={value}>{value}</option>}
      {VENEZUELAN_STATES.map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  );
}
