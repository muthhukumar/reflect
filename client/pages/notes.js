import Page from "../components/Page/index";
import Nc from "../components/pages/notes/index";
import getNotes from "../lib/getNotes";

export default function Notes() {
  return (
    <Page title="Notes" data={getNotes()}>
      <Nc notes={getNotes()} />
    </Page>
  );
}

/*
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
*/
