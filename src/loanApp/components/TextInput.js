import React from "react";

export default function TextInput({
  label,
  name,
  id,
  register,
  required,
  type = "text",
  error,
  placeholder,
}) {
  const inputId = id || `input_${name}`;

  return (
    <div className="flex flex-col">
      <label htmlFor={inputId} className="text-sm font-medium mb-1">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={inputId}
        {...(register ? register(name, { required }) : {})}
        type={type}
        placeholder={placeholder}
        aria-required={!!required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`border rounded px-3 py-2`}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-red-600 text-sm mt-1" role="alert">
          {error.message || error}
        </span>
      )}
    </div>
  );
}
