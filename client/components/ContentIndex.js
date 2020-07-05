export default function ContentIndex({ title, contents }) {
  return (
    <div className="container">
      <h3>{title}</h3>
      <ul>
        {contents.map((content) => (
          <a href={"#test"} className="content-container" key={content}>
            <span>{"</>"}</span>
            <li className="content">{content}</li>
          </a>
        ))}
      </ul>
      <style jsx>
        {`
          .container {
            position: fixed;
            grid-area: menu;
            max-width: 23rem;
            min-width: 19rem;
            box-shadow: 0 0 10px 2px var(--light);
            display: flex;
            margin: 0.7rem;
            padding: 0.7rem;
            align-items: flex-start;
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
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            overflow-y: auto;
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
            margin: 0 0.8rem;
          }
          .content {
            margin: 0.1rem 0;
            color: var(--white);
            text-transform: capitalize;
            font-size: 1.3rem;
          }
        `}
      </style>
    </div>
  );
}
