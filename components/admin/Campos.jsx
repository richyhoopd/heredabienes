"use client";

const baseInput =
  "w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

export function Campo({ label, htmlFor, error, ayuda, children, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : ayuda ? (
        <p className="text-xs text-gray-400 mt-1">{ayuda}</p>
      ) : null}
    </div>
  );
}

export function CampoTexto({
  label,
  name,
  value,
  onChange,
  error,
  ayuda,
  placeholder,
  type = "text",
  className = "",
}) {
  return (
    <Campo label={label} htmlFor={name} error={error} ayuda={ayuda} className={className}>
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${baseInput} ${error ? "border-red-300" : "border-gray-200"}`}
      />
    </Campo>
  );
}

export function CampoNumero({
  label,
  name,
  value,
  onChange,
  error,
  ayuda,
  placeholder,
  sufijo,
  className = "",
}) {
  return (
    <Campo label={label} htmlFor={name} error={error} ayuda={ayuda} className={className}>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          inputMode="decimal"
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${baseInput} ${sufijo ? "pr-12" : ""} ${
            error ? "border-red-300" : "border-gray-200"
          }`}
        />
        {sufijo && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {sufijo}
          </span>
        )}
      </div>
    </Campo>
  );
}

export function CampoTextarea({
  label,
  name,
  value,
  onChange,
  error,
  ayuda,
  rows = 5,
  placeholder,
}) {
  return (
    <Campo label={label} htmlFor={name} error={error} ayuda={ayuda}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${baseInput} ${error ? "border-red-300" : "border-gray-200"}`}
      />
    </Campo>
  );
}

export function CampoSelect({
  label,
  name,
  value,
  onChange,
  error,
  opciones = [],
  className = "",
}) {
  return (
    <Campo label={label} htmlFor={name} error={error} className={className}>
      <select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${baseInput} bg-white capitalize ${
          error ? "border-red-300" : "border-gray-200"
        }`}
      >
        {opciones.map((op) => (
          <option key={op} value={op} className="capitalize">
            {op}
          </option>
        ))}
      </select>
    </Campo>
  );
}

export function CampoCheck({ label, name, checked, onChange, ayuda }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none py-2">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onChange(name, e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#0098FF]"
      />
      <span>
        <span className="block text-sm font-semibold text-gray-700">{label}</span>
        {ayuda && <span className="block text-xs text-gray-400">{ayuda}</span>}
      </span>
    </label>
  );
}
