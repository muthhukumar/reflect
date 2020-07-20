import Card from "../../report/Card";
import styles from "./report.module.css";
import Popup from "../../popup/index";

export default function Report({ reports }) {
  return (
    <div className={styles.reportcards}>
      <Popup title="Add reports">add reports</Popup>
      {reports.map((report) => (
        <Card
          id={report._id.$oid}
          key={report._id.$oid}
          quote={report.quote}
          date={report.date}
          notes={report.notes}
          done={report.done}
        />
      ))}
    </div>
  );
}
