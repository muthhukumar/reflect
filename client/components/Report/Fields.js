export default function ({ title, content }) {
  return (
    <div className="reportField">
      <div className="title">{title}</div>
      {Array.isArray(content) ? (
        <ul>
          {content.length === 0 ? (
            <p className="content">None</p>
          ) : (
            content.map((value) => (
              <p key={value} className="content">
                {value}
              </p>
            ))
          )}
        </ul>
      ) : (
        <ul>
          <p className="content">{content}</p>
        </ul>
      )}
      <style jsx>
        {`
          .reportField {
            padding: 0.6rem;
            margin: 0.4rem 0;
            background: #ccc;
            border-radius: 5px;
          }
          .title {
            color: var(--font-color);
            margin: 0.3rem 0;
            font-size: 1.3rem;
          }
          .content {
            font-size: 1.1rem;
            border-bottom: 1px solid black;
            padding: 0 0 0.2rem 0;
          }
        `}
      </style>
    </div>
  );
}
