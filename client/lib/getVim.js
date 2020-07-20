export default function getVimCommands() {
  return [
    {
      _id: { $oid: "5f0153c000fbaa17009cfe91" },
      command: "none",
      keyBinding: "gd",
      action: "go to the definition of the selected text",
      search: ["coc", "g", "d", "definition", "custom", "movement"],
      title: "coc definition",
    },
    {
      _id: { $oid: "5f0153c000efa739009cfe92" },
      command: "none",
      keyBinding: "ctrl *",
      action:
        "find the given word the cursor in and iterate through all the posibilites",
      search: ["default", "*", "movement", "word", "movement"],
      title: "move by given word",
    },
    {
      _id: { $oid: "5f0153c000b77796009cfe93" },
      command: "GFiles",
      keyBinding: "ctrl p",
      action:
        "search file inside a git repository locally. It list all the files in the given repository",
      search: ["fzf", "custom", "p", "git", "gfiles", "search", "movement"],
      title: "search git file",
    },
  ];
}
