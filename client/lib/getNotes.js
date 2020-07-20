export default function getNotes() {
  return [
    {
      _id: { $oid: "5f015808001129eb00717222" },
      title: "color",
      search: ["color palette", "visual", "color"],
      source: ["https://coolors.co/"],
      content: ["select color palette for webpages"],
    },
    {
      _id: { $oid: "5f01580800bca9d700717223" },
      title: "font",
      search: ["font", "visual", "font pair"],
      source: ["https://fontpair.co/"],
      content: [
        "select font for webpages",
        "pair title font with body fonts so the web page looks nice",
      ],
    },
    {
      _id: { $oid: "5f015808009a0a8800717224" },
      title: "authenticaion",
      search: [
        "jwt",
        "security",
        "cookies",
        "sessions",
        "auth",
        "auth0",
        "next.js",
        "react",
      ],
      source: "bookmark from twitter(Mobile chrome)(google account)",
      content: [
        "jwt",
        "advanced react security patterns",
        "cookies/sessions",
        "auth",
        "with auth0",
        "next.js",
      ],
    },
    {
      _id: { $oid: "5f01580800f6d60700717225" },
      title: "cache deno modules",
      search: ["deno", "typescript", "autocompletition", "cache"],
      source: ["CocCommand deno.cache"],
      content: [
        "cache the deno types in the root directory",
        "now we can get good auto completition",
      ],
    },
  ];
}
