const tree = require("./src/tree");

const t = new tree("@1");

t.append(t.node("n1@1"));
t.append(t.node("n2@1"));
t.append(t.node("n3@1"));

t.eq(1).append(t.node("n1@n2@1"));
t.eq(1).append(t.node("n2@n2@1"));

console.log(t.lsa().map((n) => "" + n).join(", "));

//eof
