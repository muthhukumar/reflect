import styles from "./content-index.module.css";

export default function ContentIndex({ type, title, closeMenu, data }) {
  return (
    <div className={styles.container}>
      <button className={styles.close} onClick={closeMenu}>
        x
      </button>
      <h3>{data.length !== 0 ? title : "None"}</h3>
      <ul>
        {data.length >= 0 ? (
          data.map((content) => (
            <li key={content._id.$oid}>
              <a
                className={styles.contentcontainer}
                href={`#${content._id.$oid}`}
              >
                <span>{"</>"} </span>
                {type.toLowerCase() === "vim" && (
                  <div className={styles.content}>{content.title}</div>
                )}
                {type.toLowerCase() === "reports" && (
                  <div className={styles.content}>{content.date}</div>
                )}
                {type.toLowerCase() === "notes" && (
                  <div className={styles.content}>{content.title}</div>
                )}
              </a>
            </li>
          ))
        ) : (
          <li>
            <a className={styles.contentcontainer}>index not found</a>
          </li>
        )}
      </ul>
    </div>
  );
}
