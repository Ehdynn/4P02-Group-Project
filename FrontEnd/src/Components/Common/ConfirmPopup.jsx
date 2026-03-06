const ConfirmPopup = ({
  isOpen,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onResponse,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onResponse?.(true);
  };

  const handleCancel = () => {
    onResponse?.(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <h2 className="h2-large mb-3">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-3 py-2 bg-red-500 text-white rounded"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
