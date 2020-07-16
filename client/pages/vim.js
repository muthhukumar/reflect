import Head from "next/head";
import Layout from "../components/Layout";
import Card from "../components/vimComponents/Card";

export default function ({ data }) {
  return (
    <Layout title="Vim Commands" data={data} type="vim">
      <Head>
        <title>Vim commands</title>
      </Head>
      <main>
        <div className="vim-cards">
          {data.map((vimCommand) => (
            <Card
              id={vimCommand._id.$oid}
              key={vimCommand._id.$oid}
              action={vimCommand.action}
              command={vimCommand.command}
              keyBinding={vimCommand.keyBinding}
              title={vimCommand.title}
            />
          ))}
        </div>
      </main>
      <style jsx>
        {`
          main {
            padding-top: 3.9rem;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-areas: "content";
          }
          .vim-cards {
            justify-content: center;
            grid-template-columns: repeat(auto-fit, minmax(25.3rem, auto));
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
    console.log(vimCommands);
  } catch (err) {
    data = [];
  }
  return { props: { data } };
}
