import styles from "./popup-card.module.css";

const PopupCard = ({ onAddHandler, onCancelHandler, children, title }) => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h3>{title}</h3>
        </div>
        <div className={styles.bodyWrapper}>{children}</div>
        <div className={styles.clickHandler}>
          <button onClick={onAddHandler}>ADD</button>
          <button onClick={onCancelHandler}>CANCEL</button>
        </div>
      </div>
    </div>
  );
};

export default PopupCard;
