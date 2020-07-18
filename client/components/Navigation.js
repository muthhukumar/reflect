import { useRouter } from "next/router";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navigation({
  onBlur,
  searchTerm,
  onSearchTermChange,
  openIndex,
}) {
  const router = useRouter();
  return (
    <div className={`navigation`}>
      <div className="burder-menu" onClick={openIndex}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="title">Reflect</div>
      <ul>
        <li>
          <Link href="/" as="/">
            <a
              className={`${
                router.pathname.substring(1) === "" && "highlight"
              }`}
            >
              home
            </a>
          </Link>
        </li>
        <li>
          <Link href="/vim" as="/vim">
            <a
              className={`${
                router.pathname.substring(1) === "vim" && "highlight"
              }`}
            >
              vim
            </a>
          </Link>
        </li>
        <li>
          <Link href="/report" as="/report">
            <a
              className={`${
                router.pathname.substring(1) === "report" && "highlight"
              }`}
            >
              report
            </a>
          </Link>
        </li>
        <li>
          <Link href="/notes" as="/notes">
            <a
              className={`${
                router.pathname.substring(1) === "notes" && "highlight"
              }`}
            >
              notes
            </a>
          </Link>
        </li>
        <SearchBar
          onBlur={onBlur}
          value={searchTerm}
          onSearchTermChange={onSearchTermChange}
        />
      </ul>
      <style jsx>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");
          .navigation {
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            background: var(--light);
            top: 0;
            left: 0;
            min-width: 100%;
            z-index: 1;
            box-shadow: 0 0 5px 1px var(--light);
          }
          .burder-menu {
            position: fixed;
            top: 1.2rem;
            left: 1.5rem;
            width: 1.5rem;
            height: 1.5rem;
            display: flex;
            justify-self: flex-start;
            justify-content: space-between;
            flex-direction: column;
            box-shadow: 0 0 5px 1px var(--light);
          }
          .burder-menu:hover {
            cursor: pointer;
          }
          .burder-menu div {
            width: 100%;
            height: 2px;
            background: white;
          }
          .navigation ul {
            margin: 0 1.5rem;
            display: flex;
            padding: 0;
            align-items: center;
            justify-content: space-around;
            list-style: none;
          }
          .title {
            margin: 0;
            margin: 0 2rem;
            font-size: 1.5rem;
            letter-spacing: 1px;
            color: var(--white);
          }
          .navigation li {
            margin: 0 2rem;
          }
          .highlight {
            border-bottom: 3px solid var(--font-color);
          }
          .navigation a {
            letter-spacing: 0.8px;
            vertical-align: middle;
            text-decoration: none;
            color: var(--white);
            font-family: "Roboto", sans-serif;
            text-transform: capitalize;
            font-size: 1.2rem;
          }
        `}
      </style>
    </div>
  );
}
