import Head from "next/head";

import Layout from "../components/Layout";
import Card from "../components/Notes/Card";
import { useFilter } from "../lib/Filter-hook";

export default function Notes({ notes }) {
  const [onSearchTermChange, searchTerm, filtered, setSearchTerm] = useFilter(
    notes
  );
  return (
    <Layout
      type="notes"
      data={notes}
      title="Notes"
      onBlur={() => setSearchTerm("")}
      onSearchTermChange={onSearchTermChange}
      value={searchTerm}
    >
      <Head>
        <title>Notes</title>
      </Head>
      <main>
        <div className="note-cards">
          {filtered.map((note) => (
            <Card
              key={note._id.$oid}
              id={note._id.$oid}
              title={note.title}
              search={note.search}
              source={note.source}
              content={note.content}
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
            grid-template-areas: "searchbar" "content";
          }
          .note-cards {
            grid-template-columns: repeat(auto-fill, minmax(25rem, auto));
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
