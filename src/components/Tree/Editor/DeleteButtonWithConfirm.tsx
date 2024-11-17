import { t } from 'i18next';
import { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';

function DeleteButton({onConfirm}: {onConfirm: () => void}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    setShowConfirm(!showConfirm);
  };

  const handleDelete = () => {
    onConfirm();
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center space-x-2">
      {showConfirm ? (
        <div className="flex items-center rounded-md">
          <button
            onClick={handleDelete}
            className="flex items-center h-11 px-4 py-[8.5px] transition-colors duration-200 bg-red-500 hover:bg-red-600 text-white rounded-l-md"
          >
            {t('delete')}
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center h-11 px-4 py-[8.5px] transition-colors duration-200 bg-gray-200 hover:bg-gray-300 rounded-r-md"
          >
            {t('cancel')}
          </button>
        </div>
      ) : (
        <button
          onClick={handleToggle}
          className="p-[12px] bg-red-500 hover:bg-red-600 transition-colors duration-200 rounded-md"
          aria-label={t('delete')}
        >
          <FaTrashAlt className="h-4 w-4 text-white" />
        </button>
      )}
    </div>
  );
}

export default DeleteButton;