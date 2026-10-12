import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "glass";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground shadow-sm shadow-primary/30 hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
    ghost: "text-foreground hover:bg-secondary",
    outline: "border border-input bg-white text-foreground hover:bg-secondary/60",
    glass: "border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20",
};

const buttonSizes: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-14 px-6 text-base",
};

export const buttonClasses = (variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) =>
    cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-60",
        buttonVariants[variant],
        buttonSizes[size],
        className
    );

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

export function Button({ variant, size, loading, className, children, disabled, ...props }: ButtonProps) {
    return (
        <button className={buttonClasses(variant, size, className)} disabled={disabled || loading} {...props}>
            {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
            {children}
        </button>
    );
}

export const inputClasses = cn(
    "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm text-foreground shadow-sm",
    "placeholder:text-muted-foreground/70 transition-colors",
    "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    function Input({ className, ...props }, ref) {
        return <input ref={ref} className={cn(inputClasses, className)} {...props} />;
    }
);

export function Field({ label, htmlFor, hint, children }: {
    label: string;
    htmlFor?: string;
    hint?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={htmlFor} className="block text-sm font-semibold text-foreground">
                {label}
            </label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

export function Chip({ selected, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            className={cn(
                "inline-flex h-9 items-center justify-center rounded-full border px-3.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                selected
                    ? "border-foreground bg-foreground text-white"
                    : "border-input bg-white text-foreground hover:border-foreground/40",
                className
            )}
            {...props}
        />
    );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("rounded-3xl bg-card text-card-foreground shadow-2xl shadow-black/30 ring-1 ring-black/5", className)}
            {...props}
        />
    );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success"; children: React.ReactNode }) {
    return (
        <p
            role={tone === "error" ? "alert" : "status"}
            className={cn(
                "rounded-xl px-3.5 py-2.5 text-sm",
                tone === "error" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
            )}
        >
            {children}
        </p>
    );
}

export function Spinner({ className }: { className?: string }) {
    return <LoaderCircle className={cn("h-6 w-6 animate-spin text-white/80", className)} aria-label="Loading" />;
}
