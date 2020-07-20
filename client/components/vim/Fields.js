export default function Fields({ content, title }) {
  return (
    <div className="container">
      <div className="title">{title}</div>
      {Array.isArray(content) ? (
        <ul>
          {content.map((c) => (
            <p key={c + Math.random()} className="content">
              {c}
            </p>
          ))}
        </ul>
      ) : (
        <p className="content">{content}</p>
      )}
      <style jsx>
        {`
          .container {
            display: flex;
            align-items: flex-start;
            justify-content: space-around;
            flex-direction: column;
            width: 100%;
            margin: 0.3rem;
          }
          .container ul {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 0;
            flex-wrap: wrap;
            width: 100%;
          }
          .container ul p {
            width: auto;
            margin: 0 0.4rem;
          }
          .title {
            margin: 0.1rem 0;
            font-weight: 400;
            letter-spacing: 3.1px;
            font-size: 1rem;
            text-transform: uppercase;
            font-weight: bold;
            color: var(--font-color);
          }
          .content {
            padding: 0;
            width: 100%;
            word-wrap: break-word;
            font-size: 1rem;
            margin: 0.05rem 0;
            color: var(--dark-black);
          }
        `}
      </style>
    </div>
  );
}
