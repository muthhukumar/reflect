import React, { useState } from "react";

import styles from "./input-card.module.css";

const InputCard = ({ type, value, onValueChange }) => {
  const [inputValue, setInputValue] = useState("");
  return (
    <>
      {type !== "single" ? (
        value.map((value) => (
          <h3 className={styles.inputvalue} key={value + Math.random()}>
            {value}
          </h3>
        ))
      ) : (
        <h3 className={styles.inputvalue}>{value}</h3>
      )}
      {(value === "" || type !== "single") && (
        <form
          className={styles.wrapper}
          onSubmit={(e) => {
            e.preventDefault();
            if (type !== "single")
              onValueChange((prev) => [...prev, inputValue]);
            else onValueChange(inputValue);
            setInputValue("");
          }}
        >
          <input
            value={inputValue}
            type="text"
            placeholder="card name"
            onChange={(e) => setInputValue(e.target.value)}
          />
        </form>
      )}
    </>
  );
};

export default InputCard;
