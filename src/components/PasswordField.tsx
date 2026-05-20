import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
};

/**
 * Champ mot de passe sécurisé :
 * - bouton œil afficher / masquer
 * - bouton œil désactivé pendant la saisie (champ focus)
 * - bloque copier / couper / coller / menu contextuel / autocomplétion / correcteur
 */
export function PasswordField({
  label,
  value,
  onChange,
  autoComplete = "new-password",
  minLength = 6,
  required = true,
}: Props) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const block = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="relative mt-1">
        <input
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onCopy={block}
          onCut={block}
          onPaste={block}
          onContextMenu={block}
          onDrag={block}
          onDrop={block}
          autoComplete={autoComplete}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="w-full rounded-md border border-border bg-background px-4 py-2.5 pr-11 text-sm focus:border-primary outline-none"
        />
        <button
          type="button"
          disabled={focused}
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          title={focused ? "Terminez votre saisie pour afficher" : show ? "Masquer" : "Afficher"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
