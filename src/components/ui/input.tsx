import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-cream-400 bg-white px-3.5 py-2 text-sm",
        "placeholder:text-ink-300 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus:outline-none focus:ring-2 focus:ring-moss-200 focus:border-moss-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[88px] w-full rounded-lg border border-cream-400 bg-white px-3.5 py-2.5 text-sm leading-relaxed",
        "placeholder:text-ink-300",
        "focus:outline-none focus:ring-2 focus:ring-moss-200 focus:border-moss-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors resize-y",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium text-ink-500 leading-none mb-2 block",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, label, hint, error, htmlFor, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col", className)} {...props}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {hint && !error ? (
        <p className="text-xs text-ink-300 mt-1.5">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      ) : null}
    </div>
  )
);
Field.displayName = "Field";
