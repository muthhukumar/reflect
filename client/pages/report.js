import Layout from "../components/Layout";
import ContentIndex from "../components/ContentIndex";

const reports = [
  {
    _id: { $oid: "5f01566500c9cad70004cda9" },
    notes: [],
    date: "30.06.2020",
    done: [
      " In the morning rectified the problem and reuploaded to the vercel",
      " ended up not working. because i did not configured the env variables correctly",
      " The firefox did not show any socket request in the hosted page and shifted to the chrome there is show ",
      "   the socket url is wrong",
      " Then updated the env variable and now it working",
      " planned on make the website mobile first",
      " removed all the styles and worked from scratch",
      " home page looks awesome, only the chat page need to be updated",
    ],
    quote: [],
  },
];
export default function Report() {
  return (
    <Layout>
      <main>
        <ContentIndex title="Reports" data={reports} type="report" />
      </main>
      <style jsx>
        {`
          main {
            padding-top: 5rem;
            display: grid;
            grid-template-columns: 20rem 1fr;
            grid-template-areas: "menu content";
          }
          .report-cards {
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
/*
export async function getServerSideProps() {
  const response = await fetch(process.env.NEXT_PUBLIC_API + "/report");
  const { reports } = await response.json();
  return {
    props: {
      reports,
    },
  };
}*/
