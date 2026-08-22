import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useT } from "../../lib/i18n/t";

export function NewDepartmentDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
}) {
  const t = useT();
  const [name, setName] = useState("");

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("departments.newDepartment")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-3"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {t("newDepartment.nameLabel")}
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("newDepartment.namePlaceholder")}
            className="h-9 w-full rounded-lg px-3 text-sm outline-none transition-shadow"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
          />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" disabled={!name.trim()}>
            {t("common.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
