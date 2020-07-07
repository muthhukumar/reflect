export default function ContentIndex({ type, title, data }) {
  return (
    <div className="container">
      <h3>{title}</h3>
      <ul>
        {data.map((content) => (
          <li key={content._id.$oid}>
            <a className="content-container" href={`#${content._id.$oid}`}>
              <span>{"</>"} </span>
              {type === "vim" && <div className="content">{content.title}</div>}
              {type === "report" && (
                <div className="content">{content.date}</div>
              )}
              {type === "notes" && (
                <div className="content">{content.title}</div>
              )}
            </a>
          </li>
        ))}
      </ul>
      <style jsx>
        {`
          .container {
            grid-area: menu;
            max-width: 23rem;
            min-width: 19rem;
            box-shadow: 0 0 10px 2px var(--light);
            display: flex;
            margin: 0.7rem;
            padding: 0.7rem;
            align-items: center;
            flex-direction: column;
          }
          .container h3 {
            background: var(--light);
            padding: 0.5rem 0;
            width: 100%;
            text-align: center;
            color: #ccc;
            letter-spacing: 2.5px;
          }
          .container ul {
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            scrollbar-width: none;
            justify-content: center;
            list-style: none;
          }
          .content-container {
            display: flex;
            text-decoration: none;
            justify-content: flex-start;
            align-items: center;
          }
          .content-container span {
            color: var(--font-color);
          }
          .content {
            margin: 0.1rem 0;
            color: var(--white);
            margin-left: 0.5rem;
            text-transform: capitalize;
            font-size: 1.3rem;
          }
          .container ul::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
}
/*
          <a className="content-container" key={content._id.$oid}>
            <span>{"</>"}</span>
            {type === "vim" && <li className="content">{content.title}</li>}
            {type === "report" && <li className="content">{content.date}</li>}
            {type === "notes" && <li className="content">{content.title}</li>}
          </a>
          */
