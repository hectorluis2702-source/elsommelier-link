"use client";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

export default function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: SliderProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-xs uppercase tracking-widest text-cream/50">
          {label}
        </label>
        <span className="font-display text-lg text-gold-200">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="kdp-slider w-full"
      />
    </div>
  );
}
