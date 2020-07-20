import styles from "./vim.module.css";
import Card from "../../vim/Card";
import Popup from "../../popup/index";
import InputBoard from "../../input-board/index";

const Vim = ({ data }) => {
  return (
    <div className={styles.vimcards}>
      <Popup title="Add vim commands">
        <InputBoard />
        <InputBoard />
        <InputBoard />
      </Popup>
      {data.map((vimCommand) => (
        <Card
          id={vimCommand._id.$oid}
          key={vimCommand._id.$oid}
          action={vimCommand.action}
          command={vimCommand.command}
          keyBinding={vimCommand.keyBinding}
          search={vimCommand.search}
          title={vimCommand.title}
        />
      ))}
    </div>
  );
};

export default Vim;
