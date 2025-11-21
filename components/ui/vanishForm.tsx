"use client";

import React, { useState, useRef } from "react";
import { cx } from "@/styled-system/css";
import { vanishFormStyles } from "./vanishForm.styles";

export function VanishForm({
  placeholder,
  onChange,
  onSubmit,
  type = "text",
  isLoading = false,
  loadingText,
  value: controlledValue,
}: {
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  type?: "text" | "email" | "password";
  isLoading?: boolean;
  loadingText?: string;
  value?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit && onSubmit(e);
    }
  };

  return (
    <form
      className={vanishFormStyles.form}
      onSubmit={handleSubmit}
    >
      <label className={vanishFormStyles.label}>
        <input
          type={type}
          onChange={(e) => {
            if (controlledValue === undefined) {
              setInternalValue(e.target.value);
            }
            onChange && onChange(e);
          }}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          disabled={isLoading}
          className={cx(
            vanishFormStyles.input,
            isLoading && vanishFormStyles.inputDisabled
          )}
        />

        <button
          type="submit"
          disabled={isLoading}
          className={vanishFormStyles.submitButton}
        >
          {isLoading ? (
            <div className={vanishFormStyles.loadingWrapper}>
              {loadingText && (
                <span className={vanishFormStyles.loadingText}>
                  [{loadingText} <span className={vanishFormStyles.loadingSpinner} />]
                </span>
              )}
            </div>
          ) : !value ? (
            "→"
          ) : (
            <p className={vanishFormStyles.enterHint}>
              [enter]
            </p>
          )}
        </button>
      </label>
    </form>
  );
}
