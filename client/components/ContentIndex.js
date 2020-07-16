export default function ContentIndex({ type, title, closeMenu, data }) {
  return (
    <div className="container">
      <button className="close" onClick={closeMenu}>
        x
      </button>
      <h3>{data.length !== 0 ? title : "Title"}</h3>
      <ul>
        {data.length >= 0 ? (
          data.map((content) => (
            <li key={content._id.$oid}>
              <a className="content-container" href={`#${content._id.$oid}`}>
                <span>{"</>"} </span>
                {type === "vim" && (
                  <div className="content">{content.title}</div>
                )}
                {type === "report" && (
                  <div className="content">{content.date}</div>
                )}
                {type === "notes" && (
                  <div className="content">{content.title}</div>
                )}
              </a>
            </li>
          ))
        ) : (
          <li>
            <a className="content-container">index not found</a>
          </li>
        )}
      </ul>
      <style jsx>
        {`
          .container {
            min-width: 14rem;
            position: fixed;
            top: 0.8rem;
            left: 0;
            z-index: 50;
            box-shadow: 0 0 10px 2px var(--light);
            display: flex;
            padding: 0.7rem;
            align-items: center;
            flex-direction: column;
            background: var(--primary);
            animation: showMenu 0.8s ease-out;
          }
          .close {
            background: var(--font-color);
            position: absolute;
            width: 1.2rem;
            height: 1.2rem;
            right: 0.4rem;
            top: 0.4rem;
            font-size: 0.6rem;
            color: white;
            border: none;
            border-radius: 50%;
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
          @keyframes showMenu {
            0% {
              opacity: 0;
              transform: translateX(-10rem);
            }
            50% {
              opacity: 0;
              transform: translateX(-5rem);
            }
            100% {
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
}
