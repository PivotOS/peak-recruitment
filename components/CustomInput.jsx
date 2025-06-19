export default function CustomInput({ id, label, type, name, value, onChange, error, required = false }) {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 p-3 w-full max-w-md border-2 border-gold-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-base shadow-sm transition-all duration-200 hover:border-blue-500"
        aria-required={required}
        aria-describedby={error ? `${id}Error` : undefined}
      />
      {error && <p id={`${id}Error`} className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}