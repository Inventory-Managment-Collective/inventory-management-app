import React from "react";
import QuartermasterIcon from '../assets/Quartermaster.png';
import "../styles/QuarterMasterToast.css";

export default function QuarterMasterToast ({ message }) {
    return (
        <div className="custom-toast">
          <img src={QuartermasterIcon} alt="Quartermaster Icon" className="toast-icon" />
          <div className="speech-bubble">
            {message}
          </div>
        </div>
      );
}