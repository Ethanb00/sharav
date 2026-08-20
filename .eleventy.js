const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = function (eleventyConfig) {
  // Embeds data as JSON inside a <script type="application/json"> tag; escapes "<"
  // so a stray "</script>" in the data can't break out of the tag.
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value).replace(/</g, "\\u003c"));

  // Appends a content-hash query string to CSS/JS URLs (e.g. "/css/style.css" ->
  // "/css/style.css?v=ab12cd34") so browsers fetch the new file after a deploy
  // instead of serving a stale cached copy of an old stylesheet/script.
  eleventyConfig.addFilter("cachebust", (urlPath) => {
    try {
      const filePath = path.join(__dirname, "src", urlPath);
      const hash = crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex").slice(0, 8);
      return `${urlPath}?v=${hash}`;
    } catch (e) {
      return urlPath;
    }
  });

  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/editor": "editor" });
  eleventyConfig.addPassthroughCopy({ CNAME: "CNAME" });
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.ignores.add("src/editor/**");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
