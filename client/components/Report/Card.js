import Field from "./Fields";

export default function ({ notes, date, done, quote, id }) {
  return (
    <div className="reportCard" id={id}>
      <div className="title">{date}</div>
      <Field title="Done" content={done} />
      <Field title="Notes" content={notes} />
      <Field title="Quote" content={quote} />
      <style jsx>{`
        .reportCard {
          margin: 0.3rem;
          max-width: 30rem;
          padding: 0.6rem 0.3rem;
          padding-bottom: 0.2rem;
          border-radius: 5px;
          background: var(--secondary);
          box-shadow: 0 0 5px 1px var(--light);
        }
        .title {
          font-size: 1.4rem;
          font-weight: bold;
          color: white;
        }
        .reportCard:hover {
          box-shadow: 0 0 10px 1px var(--font-color);
        }
      `}</style>
    </div>
  );
}
