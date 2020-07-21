import Page from "../components/page/index";
import Vc from "../components/pages/vim/index";

const Vim = ({ data }) => {
  return (
    <Page title="Vim" data={data}>
      <Vc data={data} />
    </Page>
  );
};

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
