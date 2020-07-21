import Head from "next/head";
import { useState } from "react";

import styles from "./mainpage.module.css";
import Navbar from "../navbar/index";
import ContentIndex from "../content-index/index";

export default function Page({ data, children, title }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.wrapper}>
      <Head>
        <title>{title}</title>
      </Head>
      <Navbar onMenuClick={() => setIsOpen(true)} />
      {isOpen && (
        <ContentIndex
          type={title}
          data={data}
          closeMenu={() => setIsOpen((prev) => !prev)}
          title={title}
        />
      )}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
