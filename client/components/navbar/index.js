import { useRouter } from "next/router";
import Link from "next/link";
import BurderMenu from "../burger-menu/index";

import styles from "./navbar.module.css";

export default function Navigation({ onMenuClick }) {
  const router = useRouter();
  return (
    <div className={styles.navigation}>
      <BurderMenu openIndex={onMenuClick} />
      <ul>
        <li>
          <Link href="/" as="/">
            <a
              className={`${
                router.pathname.substring(1) === "" && styles.highlight
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
                router.pathname.substring(1) === "vim" && styles.highlight
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
                router.pathname.substring(1) === "report" && styles.highlight
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
                router.pathname.substring(1) === "notes" && styles.highlight
              }`}
            >
              notes
            </a>
          </Link>
        </li>
      </ul>
    </div>
  );
}
