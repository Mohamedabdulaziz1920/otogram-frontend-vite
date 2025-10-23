import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <FaCheckCircle />,
    error: <FaTimesCircle />,
    info: <FaInfoCircle />
  };

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast__icon">
        {icons[type]}
      </div>
      <div className="toast__message">
        {message}
      </div>
      <button className="toast__close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
