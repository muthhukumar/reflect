import React from "react";

import styles from "./AddButton.module.css";

const AddButton = ({ onAddHandler }) => {
  return (
    <div className={styles.container}>
      <button onClick={onAddHandler}>add</button>
    </div>
  );
};

export default AddButton;
