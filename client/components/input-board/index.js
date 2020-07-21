import styles from "./input-board.module.css";

import InputCard from "../input-card/index";

const InputBoard = ({ type, title, value, onValueChange }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h4>{title}</h4>
      </div>
      <InputCard type={type} value={value} onValueChange={onValueChange} />
    </div>
  );
};

export default InputBoard;
