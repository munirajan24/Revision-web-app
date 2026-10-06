import { useId } from 'react';
import { getProblemImportanceLabel, problemImportanceOptions, type ProblemImportance } from '../engine/problem-importance';

interface ProblemImportanceRatingProps {
  value?: ProblemImportance;
  onChange: (value: ProblemImportance | undefined) => void;
  compact?: boolean;
}

export default function ProblemImportanceRating({ value, onChange, compact = false }: ProblemImportanceRatingProps) {
  const groupName = useId();

  return (
    <fieldset className={compact ? 'problem-importance problem-importance-compact' : 'problem-importance'}>
      <legend>Importance</legend>
      <div className="problem-importance-control">
        <div className="problem-importance-options">
          {problemImportanceOptions.map((option) => (
            <label className="problem-importance-choice" key={option.value}>
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={value === option.value}
                aria-label={`${option.value} star${option.value === 1 ? '' : 's'}: ${option.label}`}
                onChange={() => onChange(option.value)}
              />
              <span aria-hidden="true" className={value !== undefined && value >= option.value ? 'problem-importance-star selected' : 'problem-importance-star'}>
                {value !== undefined && value >= option.value ? '★' : '☆'}
              </span>
            </label>
          ))}
        </div>
        <div className="problem-importance-status">
          <span className={value === undefined ? 'unrated' : 'rated'}>{getProblemImportanceLabel(value)}</span>
        </div>
      </div>
    </fieldset>
  );
}