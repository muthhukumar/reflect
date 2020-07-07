import ContentIndex from "../components/ContentIndex";
import Layout from "../components/Layout";
import Card from "../components/vimComponents/Card";

export default function ({ data }) {
  return (
    <Layout>
      <main>
        <ContentIndex title="Vim Commands" data={data} type="vim" />
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
            padding-top: 5rem;
            display: grid;
            grid-template-columns: 20rem 1fr;
            grid-template-areas: "menu content";
          }
          .vim-cards {
            justify-content: center;
            grid-template-columns: repeat(auto-fit, 28.3rem);
            display: grid;
            grid-area: content;
          }
        `}
      </style>
    </Layout>
  );
}

export async function getServerSideProps() {
  const response = await fetch(process.env.NEXT_PUBLIC_API + "/vim");
  const { vimCommands: data } = await response.json();
  return { props: { data } };
}
