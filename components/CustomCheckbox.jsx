export default function CustomCheckbox({ id, label, name, value, onChange, checked, error }) {
  return (
    <div className="mb-6">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      </label>
      {error && <p id={`${id}Error`} className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}