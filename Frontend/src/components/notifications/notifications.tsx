
import React from "react";
import PropTypes from "prop-types";

import   "./Notification.css";

export default function Notification({ color = Color.info, children }) {
  return (
    <div className="notification" style={{color:color}}>
      {children}
      <button className={"closeButton"}>
        <img src={"../../../public/images/times.svg"} height={16} />
      </button>
    </div>
  );
}

export const Color = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

Notification.propTypes = {
  notificationType: PropTypes.oneOf(Object.keys(Color)),
  children: PropTypes.element,
};