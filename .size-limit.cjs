module.exports = [
  {
    name: "JavaScript Bundle",
    path: "./dist/assets/*.js",
    limit: "500 KB",
    gzip: true
  },
  {
    name: "CSS Bundle",
    path: "./dist/assets/*.css", 
    limit: "50 KB",
    gzip: true
  }
];