import { useState, useEffect } from "react";

export const useFilter = (data) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState(data);

  const onSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    let timeOut;
    if (searchTerm !== "") {
      timeOut = setTimeout(() => {
        const newNotes = data.filter((note) =>
          note.search.some((n) => n.includes(searchTerm))
        );
        setFiltered(newNotes);
      }, 1000);
    }
    if (searchTerm === "") {
      setFiltered(data);
    }
    return () => clearTimeout(timeOut);
  }, [searchTerm]);

  return [onSearchTermChange, searchTerm, filtered, setSearchTerm];
};
