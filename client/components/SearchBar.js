export default function ({ onBlur, value, onSearchTermChange }) {
  return (
    <div className="search--bar">
      <input value={value} onChange={onSearchTermChange} placeholder="search" />
      <button onClick={onBlur}>clear</button>
      <style jsx>
        {`
          .search--bar {
            padding: 0.5rem;
            width: 100%;
            display: flex;
            align-itmes: center;
            grid-area: searchbar;
            justify-content: flex-end;
          }
          .search--bar input {
            margin: 0 0.2rem;
            padding: 0 0.5rem;
            border: none;
            border-radius: 5px;
          }
          .search--bar button {
            padding: 0.5rem;
            font-weight: bold;
            margin: 0 0.2rem;
            border: none;
            color: #767676;
            border-radius: 5px;
            background: white;
          }
        `}
      </style>
    </div>
  );
}
