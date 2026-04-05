import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
} from "react";
import fc from "@/styles/forms.module.css";

export const PasswordField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; variant?: "default" | "stitch" }
>(function PasswordField({ label, className = "", id, variant = "default", ...props }, ref) {
  const genId = useId();
  const inputId = id ?? genId;
  const [visible, setVisible] = useState(false);
  const toggleLabel = visible ? "Ocultar senha" : "Mostrar senha";

  const inputClass =
    variant === "stitch"
      ? `${fc.field} ${fc.fieldPassword} ${className}`.trim()
      : `${fc.inputDefault} ${className}`.trim();

  return (
    <label className={fc.block}>
      <span className={variant === "stitch" ? fc.labelCaps : fc.labelDefault}>{label}</span>
      <div className={fc.wrap}>
        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          className={inputClass}
          {...props}
        />
        <button
          type="button"
          className={fc.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={toggleLabel}
          title={toggleLabel}
          tabIndex={-1}
        >
          {visible ? (
            <VisibilityOff sx={{ fontSize: 20 }} aria-hidden />
          ) : (
            <Visibility sx={{ fontSize: 20 }} aria-hidden />
          )}
        </button>
      </div>
    </label>
  );
});
