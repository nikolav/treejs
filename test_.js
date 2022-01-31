const tree = require("./index");

const t = new tree("@1");

t.append(t.node({ value: "n1@1" }));
t.append(t.node({ value: "n2@1" }));
t.append(t.node({ value: "n3@1" }));

t.eq(1).append(t.node({ value: "n1@n2@1" }));
t.eq(1).append(t.node({ value: "n2@n2@1" }));

console.log(t.lsa().join(", "));

//eof
