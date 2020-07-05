import Navigation from "./Navigation";

export default function Layout({ children }) {
  return (
    <div className="container">
      <Navigation />
      {children}
      <style jsx>{`
        .container {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}
