export default function Fields({ content, type, title }) {
  return (
    <div className="container">
      <div className="title">{title}</div>
      <p className="content">{content}</p>
      <style jsx>
        {`
          .container {
            display: flex;
            align-items: flex-start;
            justify-content: space-around;
            flex-direction: column;
            margin: 0.3rem;
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
