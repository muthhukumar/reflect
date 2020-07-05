import { useState } from "react";

import ContentIndex from "../components/ContentIndex";
import Layout from "../components/Layout";
import Card from "../components/vimComponents/Card";

const url = process.env.NEXT_PUBLIC_API;

const VIM_COMMANDS = [
  {
    _id: { $oid: "5f0153c000c073a9009cfe8e" },
    command: "none",
    keyBinding: " ctrl + ^ ",
    action: "jumps to previous file",
    search: ["^", "previous file", "basic", "default", "movement"],
    title: "prev file",
  },
];

export default function (props) {
  console.log(props);
  return (
    <Layout>
      <main>
        <ContentIndex title="Vim Commands" contents={VIM_COMMANDS[0].search} />
        <div className="vim-cards">
          <Card
            action={VIM_COMMANDS[0].action}
            command={VIM_COMMANDS[0].command}
            keyBinding={VIM_COMMANDS[0].keyBinding}
            title={VIM_COMMANDS[0].title}
          />
          <Card
            action={VIM_COMMANDS[0].action}
            command={VIM_COMMANDS[0].command}
            keyBinding={VIM_COMMANDS[0].keyBinding}
            title={VIM_COMMANDS[0].title}
          />
          <Card
            action={VIM_COMMANDS[0].action}
            command={VIM_COMMANDS[0].command}
            keyBinding={VIM_COMMANDS[0].keyBinding}
            title={VIM_COMMANDS[0].title}
          />
          <Card
            action={VIM_COMMANDS[0].action}
            command={VIM_COMMANDS[0].command}
            keyBinding={VIM_COMMANDS[0].keyBinding}
            title={VIM_COMMANDS[0].title}
          />
          <Card
            action={VIM_COMMANDS[0].action}
            command={VIM_COMMANDS[0].command}
            keyBinding={VIM_COMMANDS[0].keyBinding}
            title={VIM_COMMANDS[0].title}
          />
          <Card
            id="test"
            action={VIM_COMMANDS[0].action}
            command={VIM_COMMANDS[0].command}
            keyBinding={VIM_COMMANDS[0].keyBinding}
            title={VIM_COMMANDS[0].title}
          />
        </div>
      </main>
      <style jsx>
        {`
          main {
            padding-top: 5rem;
            display: grid;
            grid-template-columns: 20rem 1fr;
            grid-template-areas: "menu content";
          }
          .vim-cards {
            justify-content: center;
            grid-template-columns: repeat(auto-fit, 28.3rem);
            grid-auto-row: minmax(14rem);
            display: grid;
            grid-area: content;
          }
        `}
      </style>
    </Layout>
  );
}

export async function getServerSideProps() {
  const response = await fetch(url + "/vim");
  const data = await response.json();
  console.log(data);
  return { props: { data } };
}
