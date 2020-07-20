import styles from "./burger-menu.module.css";

const BurgerMenu = ({ openIndex }) => {
  return (
    <div className={styles.burdermenu} onClick={openIndex}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default BurgerMenu;
