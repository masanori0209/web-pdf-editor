import React from 'react';
import { FONT_OPTIONS } from '../lib/fonts';

interface FontFamilySelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export const FontFamilySelect: React.FC<FontFamilySelectProps> = ({ id, value, onChange }) => (
  <div className="option-group">
    <label htmlFor={id}>
      フォント
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {FONT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  </div>
);
