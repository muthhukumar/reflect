import Head from "next/head";

import Layout from "../components/Layout";
import Card from "../components/Notes/Card";

export default function Notes({ notes }) {
  return (
    <Layout type="notes" data={notes} title="Notes">
      <Head>
        <title>Notes</title>
      </Head>
      <main>
        <div className="note-cards">
          {notes.map((note) => (
            <Card
              key={note._id.$oid}
              id={note._id.$oid}
              title={note.title}
              source={note.source}
              content={note.content}
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
          .note-cards {
            grid-template-columns: repeat(auto-fill, minmax(25rem, auto));
            grid-template-rows: repeat(auto-fill, minmax(5rem, auto));
            justify-content: center;
            display: grid;
            grid-area: content;
          }
        `}
      </style>
    </Layout>
  );
}

export async function getServerSideProps() {
  let notes;
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API + "/notes");
    const data = await response.json();
    notes = data.notes;
  } catch (err) {
    notes = [];
  }
  return {
    props: {
      notes,
    },
  };
}
