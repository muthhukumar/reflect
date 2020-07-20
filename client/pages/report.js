import getReports from "../lib/getReports";
import Rc from "../components/pages/report/index";
import Page from "../components/page/index";

export default function Report() {
  return (
    <Page title="reports" data={getReports()}>
      <Rc reports={getReports()} />
    </Page>
  );
}

/*
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
*/
