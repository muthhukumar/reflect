import Field from "../Report/Fields";

export default function ({ id, source, title, content }) {
  return (
    <div className="notesCard" id={id}>
      <div className="title">{title}</div>
      <Field type="array" title="source" content={source} />
      <Field type="array" title="content" content={content} />
      <style jsx>{`
        .notesCard {
          margin: 0.4rem;
          max-width: 30rem;
          padding: 1.2rem;
          border-radius: 5px;
          background: var(--secondary);
          transition: 0.5;
          box-shadow: 0 0 5px 1px var(--light);
        }
        .title {
          font-size: 1.4rem;
          font-weight: bold;
          color: white;
        }
        .notesCard:hover {
          box-shadow: 0 0 10px 1px var(--font-color);
        }
      `}</style>
    </div>
  );
}
