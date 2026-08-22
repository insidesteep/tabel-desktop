import { Modal } from "./Modal";
import { Button } from "./Button";
import { useT } from "../../lib/i18n/t";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const t = useT();
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} width={380}>
      {description && (
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel ?? t("common.delete")}
        </Button>
      </div>
    </Modal>
  );
}
