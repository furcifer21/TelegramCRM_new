/**
 * Компонент Textarea - многострочное поле ввода
 * 
 * Используется для ввода длинного текста (заметки, описание)
 */

export default function Textarea({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  rows = 4,
  className = '',
  ...props
}) {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="input-field textarea-field"
        {...props}
      />
    </div>
  );
}

