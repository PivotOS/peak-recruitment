export default function CustomSelect({ id, label, name, value, onChange, options, error, required = false }) {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 p-3 w-full max-w-md border-2 border-gold-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-base shadow-sm transition-all duration-200 hover:border-blue-500"
        aria-required={required}
        aria-describedby={error ? `${id}Error` : undefined}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>{option.label || option}</option>
        ))}
      </select>
      {error && <p id={`${id}Error`} className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}