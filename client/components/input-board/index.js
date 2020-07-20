import styles from "./input-board.module.css";

import InputCard from "../input-card/index";

const InputBoard = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3>Title</h3>
      </div>
      <InputCard />
      <InputCard />
    </div>
  );
};

export default InputBoard;
