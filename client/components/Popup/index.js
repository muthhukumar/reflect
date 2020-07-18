import React from "react";

import styles from "./Popup.module.css";

const Popup = ({ onAddHandler, onCancelHandler, children, title }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{title}</h3>
      </div>
      {children}
      <div className={styles.addHandler}>
        <button onClick={onAddHandler}>ADD</button>
        <button onClick={onCancelHandler}>CANCEL</button>
      </div>
    </div>
  );
};

export default Popup;
