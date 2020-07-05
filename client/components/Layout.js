import Navigation from "./Navigation";

export default function Layout({ children }) {
  return (
    <div className="container">
      <Navigation />
      <div className="background" />
      {children}
      <style jsx>{`
        .container {
          min-height: 100%;
        }
      `}</style>
    </div>
  );
}
