import { z } from "zod";

const frenchErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return { message: issue.received === "undefined" ? "champ obligatoire" : "valeur invalide" };
    case z.ZodIssueCode.too_small:
      return {
        message:
          issue.type === "string"
            ? `au moins ${issue.minimum} caractère(s)`
            : issue.type === "array"
              ? `au moins ${issue.minimum} élément(s)`
              : `doit être supérieur ou égal à ${issue.minimum}`,
      };
    case z.ZodIssueCode.too_big:
      return {
        message:
          issue.type === "string"
            ? `${issue.maximum} caractères maximum`
            : issue.type === "array"
              ? `${issue.maximum} éléments maximum`
              : `doit être inférieur ou égal à ${issue.maximum}`,
      };
    case z.ZodIssueCode.invalid_string:
      return {
        message:
          issue.validation === "email"
            ? "adresse email invalide"
            : issue.validation === "url"
              ? "lien invalide"
              : issue.validation === "uuid"
                ? "identifiant invalide"
                : "format invalide",
      };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: "valeur non autorisée" };
    default:
      return { message: ctx.defaultError };
  }
};

// Validates server function input and throws a readable French message
// (instead of the raw zod JSON) when it is invalid.
export function parseInput<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input, { errorMap: frenchErrorMap });
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  const field = issue.path.join(".");
  // Messages written in the schemas are already full sentences.
  const isCustom = issue.code === z.ZodIssueCode.custom || /^[A-ZÀ-Ý«]/.test(issue.message);
  throw new Error(isCustom || !field ? issue.message : `Champ « ${field} » : ${issue.message}.`);
}
