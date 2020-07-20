import React, { useState } from "react";

import styles from "./input-card.module.css";

const InputCard = (props) => {
  const [isEntered, setEntered] = useState(false);
  const [value, setInpuValue] = useState("");
  return (
    <form
      className={styles.wrapper}
      onSubmit={(e) => {
        e.preventDefault();
        setEntered(true);
      }}
    >
      {!isEntered && (
        <input
          value={value}
          type="text"
          placeholder="card name"
          onChange={(e) => setInpuValue(e.target.value)}
        />
      )}
      {isEntered && <h3>{value}</h3>}
    </form>
  );
};

export default InputCard;
