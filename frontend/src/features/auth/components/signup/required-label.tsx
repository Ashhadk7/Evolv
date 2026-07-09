// Small labelled field header with an optional required-asterisk, shared by the
// sign-up wizard's custom form controls.
export function RequiredLabel({ label, required = false }: { label: string; required?: boolean }) {
  return (
    <span
      className="mb-1.5 block text-[12px] font-semibold"
      style={{ color: "rgba(15,28,24,0.68)" }}
    >
      {label}
      {required && <span className="ml-1 align-super text-[10px] text-red-500">*</span>}
    </span>
  );
}
