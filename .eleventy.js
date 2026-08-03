const markdownIt = require("markdown-it")({ html: false, breaks: false, linkify: true });

module.exports = function (eleventyConfig) {
  // Renders Markdown from Decap CMS's "richtext" fields (e.g. about_body) as real HTML.
  eleventyConfig.addFilter("markdown", (value) => (value ? markdownIt.render(value) : ""));

  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ CNAME: "CNAME" });
  eleventyConfig.ignores.add("src/admin/**");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
