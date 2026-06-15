export default {
  paths() {
    return [
      {
        params: { pkg: "preactpress" },
        props: {
          name: "PreactPress",
          summary: "The documentation framework package rendered as a static dynamic route.",
        },
      },
      {
        params: { pkg: "preact" },
        props: {
          name: "Preact",
          summary: "A second route proves that one template can render multiple static pages.",
        },
      },
    ];
  },
};
