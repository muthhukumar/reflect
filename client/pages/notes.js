import Layout from "../components/Layout";

export default function Notes(props) {
  console.log(props);
  return (
    <Layout>
      <main>Notes</main>
      <style jsx>
        {`
          main {
            margin-top: 5rem;
          }
        `}
      </style>
    </Layout>
  );
}

