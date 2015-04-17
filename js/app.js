var data;

d3.json("assets/data/cancer_counts.json", function(error, json) {
  if (error) return console.warn(error);
  data = json;
  main();
});

main = function() {
  
}
