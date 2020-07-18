import Head from "next/head";

import Layout from "../components/Layout";
import Card from "../components/vimComponents/Card";
import { useFilter } from "../lib/Filter-hook";
import AddButton from "../components/AddButton/index";
import Popup from "../components/Popup/index";

const Vim =  ({ data }) => {
  const [onSearchTermChange, searchTerm, filtered, setSearchTerm] = useFilter(
    data
  );
  return (
    <Layout
      title="Vim Commands"
      data={data}
      type="vim"
      onBlur={() => setSearchTerm("")}
      onSearchTermChange={onSearchTermChange}
      value={searchTerm}
    >
      <Head>
        <title>Vim commands</title>
      </Head>
      <main>
        <AddButton onAddHandler={() => {}} />
        <Popup onAddHandler={() => {}} title="Add vim command"></Popup>
        <div className="vim-cards">
          {filtered.map((vimCommand) => (
            <Card
              id={vimCommand._id.$oid}
              key={vimCommand._id.$oid}
              action={vimCommand.action}
              command={vimCommand.command}
              keyBinding={vimCommand.keyBinding}
              search={vimCommand.search}
              title={vimCommand.title}
            />
          ))}
        </div>
      </main>
      <style jsx>
        {`
          main {
            padding-top: 5rem;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-areas:
              "addnew"
              "content";
          }
          .vim-cards {
            justify-content: center;
            grid-template-columns: repeat(auto-fit, minmax(15rem, auto));
            display: grid;
            grid-area: content;
          }
        `}
      </style>
    </Layout>
  );
}
export async function getServerSideProps() {
  let data;
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API + "/vim");
    const { vimCommands } = await response.json();
    data = vimCommands;
  } catch (err) {
    data = [];
  }
  return { props: { data } };
}

export default Vim;
