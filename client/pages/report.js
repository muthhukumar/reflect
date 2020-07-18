import Head from "next/head";

import Layout from "../components/Layout";
import Card from "../components/Report/Card";
import { useFilter } from "../lib/Filter-hook";

export default function Report({ reports }) {
  const [onSearchTermChange, searchTerm, filtered, setSearchTerm] = useFilter(
    reports
  );
  return (
    <Layout
      title="Reports"
      data={reports}
      type="report"
      onBlur={() => setSearchTerm("")}
      onSearchTermChange={onSearchTermChange}
      value={searchTerm}
    >
      <Head>
        <title>Report</title>
      </Head>
      <main>
        <div className="report-cards">
          {filtered.map((report) => (
            <Card
              id={report._id.$oid}
              key={report._id.$oid}
              quote={report.quote}
              date={report.date}
              notes={report.notes}
              done={report.done}
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
          .report-cards {
            grid-template-columns: repeat(auto-fill, minmax(28rem, auto));
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
  let reports;
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API + "/report");
    const data = await response.json();
    reports = data.reports;
  } catch (err) {
    reports = [];
  }
  return {
    props: {
      reports,
    },
  };
}
