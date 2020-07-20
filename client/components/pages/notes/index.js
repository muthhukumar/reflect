import Card from "../../notes/Card";
import styles from "./notes.module.css";
import Popup from "../../popup/index";

export default function Notes({ notes }) {
  return (
    <div className={styles.notecards}>
      <Popup title="Add notes">add notes</Popup>
      {notes.map((note) => (
        <Card
          key={note._id.$oid}
          id={note._id.$oid}
          title={note.title}
          search={note.search}
          source={note.source}
          content={note.content}
        />
      ))}
    </div>
  );
}
