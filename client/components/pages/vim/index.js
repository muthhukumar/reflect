import { useState } from "react";

import styles from "./vim.module.css";
import Card from "../../vim/Card";
import Popup from "../../popup/index";
import InputBoard from "../../input-board/index";

const Vim = ({ data }) => {
  const [title, setTitle] = useState("");
  const [command, setCommand] = useState("");
  const [keyBinding, setKeyBinding] = useState("");
  const [action, setAction] = useState("");
  const [search, setSearch] = useState([]);
  const [saved, setSaved] = useState(false);

  const onSumitHandler = async () => {
    let response;
    try {
      response = await fetch(process.env.NEXT_PUBLIC_API + "/vim/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          command,
          keyBinding,
          action,
          search,
        }),
      });
      if (!response.ok) throw response.statusText;
      const res = await response.json();
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className={styles.vimcards}>
      <Popup
        title="Add vim commands"
        onAddHandler={onSumitHandler}
        closePop={saved}
      >
        <InputBoard
          type="single"
          title="title"
          value={title}
          onValueChange={setTitle}
        />
        <InputBoard
          type="single"
          title="command"
          value={command}
          onValueChange={setCommand}
        />
        <InputBoard
          type="single"
          title="keyBinding"
          value={keyBinding}
          onValueChange={setKeyBinding}
        />
        <InputBoard
          type="single"
          title="action"
          value={action}
          onValueChange={setAction}
        />
        <InputBoard
          type="array"
          title="search"
          value={search}
          onValueChange={setSearch}
        />
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
