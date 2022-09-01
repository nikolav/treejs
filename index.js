/**
 * tree.js
 * admin: Nikola Vukovic
 * email: admin@nikolav.rs
 * url: https://nikolav.rs/
 * git: https://github.com/nikolav/treejs
 * public domain
 */

//
const fn = Function.prototype;
const aproto = Array.prototype;
const oproto = Object.prototype;
//
const push_ = fn.call.bind(aproto.push);
const has_ = fn.call.bind(oproto.hasOwnProperty);
const str_ = fn.call.bind(oproto.toString);
const forEach = fn.call.bind(aproto.forEach);
const isfn_ = (
  (func) => (node) =>
    func === str_(node)
)(str_(fn));

//
let ID = 1;
const idGen = () => ID++;
//
const tree = (function (none) {
  const cache_ = {};
  const idcache_ = {};
  //
  const nodeInitDefaults_ = {
    id: none,
    root: null,
    value: none,
  };

  const __CACHEID__ = "__";

  class node {
    constructor(config = {}) {
      const conf = { ...nodeInitDefaults_, ...config };
      const id = idGen();
      this[__CACHEID__] = id;

      cache_[id] = {
        children: [],
        parent: null,
        root: conf.root,
        value: conf.value,
        id: none,
        classes: {},
      };

      if (none !== conf.id) this.id(conf.id);
    }

    id = (id_) => {
      if (none !== id_) {
        let oldid_ = getid_(this);
        let idcache__ = getidcache_(this.root());

        // if id is already taken by different node
        if (has_(idcache__, id_) && this !== idcache__[id_]) {
          // remove id from node that holds it
          cc(idcache__[id_]).id = none;
        }

        // remove old entry from idcache__
        // if provided another id for this node
        if (this === idcache__[oldid_]) {
          delete idcache__[oldid_];
        }

        cc(this).id = id_;
        idcache__[id_] = this;

        return this;
      }

      return getid_(this);
    };
    //
    // classes module
    //  .classes
    //  .hasClass
    //  .addClass
    //  .removeClass
    //  .toggleClass
    //  .byClass
    classes = (cls = null) => {
      const c = cc(this);
      const { classes } = c;
      return null != cls
        ? ((c.classes = { ...classes, ...(isfn_(cls) ? cls(classes) : cls) }),
          this)
        : classes;
    };
    hasClass = (cls) => {
      return true === this.classes()[cls];
    };
    addClass = (cls) => {
      return this.classes({ [cls]: true });
    };
    removeClass = (cls) => {
      return this.classes({ [cls]: false });
    };
    toggleClass = (cls) => {
      return this.classes((classes) => ({ [cls]: !classes[cls] }));
    };
    byClass = (cls, collect = []) => {
      return this.query(byClass_, collect, { cls });
    };
    //
    //
    // pass function to calculate based on current
    value = (() => {
      const value = (val) => {
        const c = cc(this);
        return none !== val
          ? ((c.value = isfn_(val) ? val(c.value) : val), this)
          : c.value;
      };
      //
      value.merge = (val) => {
        const c = cc(this);
        const { value: currentValue } = c;
        c.value = {
          ...currentValue,
          ...(isfn_(val) ? val(currentValue) : val),
        };
        //
        return this;
      };
      //
      return value;
    })();
    next = () => {
      let next_ = null;

      try {
        next_ = this.parent().eq(1 + this.i());
      } catch (err) {}

      return next_;
    };
    prev = () => {
      let prev_ = null;
      let i = this.i();

      if (0 < i) {
        try {
          prev_ = this.parent().eq(i - 1);
        } catch (err) {}
      }

      return prev_;
    };
    parent = () => {
      return cc(this).parent;
    };
    root = () => {
      return cc(this).root;
    };

    append = (node) => {
      return this.place(-1, node);
    };
    prepend = (node) => {
      return this.place(0, node);
    };
    place = (i, node) => {
      const ls = lschildren_(this);
      const R = this.root();
      const l = ls.length;

      if (i < 0) i = i + 1 + l;

      if (i <= l) {
        if (node.isplaced()) node.parent().rm(node);

        if (R !== node.root()) cc(node).root = R;

        ls.splice(i, 0, node);
        setParentNode_(node, this);
      }

      return this;
    };
    after = (ref, node) => {
      if (this.has(ref)) this.place(ref.i() + 1, node);

      return this;
    };
    before = (ref, node) => {
      if (this.has(ref)) this.place(ref.i(), node);

      return this;
    };
    rm = (node) => {
      if (this.has(node)) {
        lschildren_(this).splice(node.i(), 1);
        setParentNode_(node, null);
      }
      return this;
    };

    i = () => {
      const ptnode = this.parent();
      return ptnode ? lschildren_(ptnode).indexOf(this) : -1;
    };
    len = () => {
      return lschildren_(this).length;
    };
    ls = () => {
      return lschildren_(this).slice();
    };
    lsa = (list = []) => {
      if (this.len()) lschildren_(this).forEach(collector_, list);
      return list;
    };
    traverse = (callback, context) => {
      lschildren_(this).forEach(traverser_, { callback, context });
      return this;
    };
    query = (callback, list = [], context) => {
      this.traverse(query_, { callback, list, context });
      return list;
    };
    eq = (i) => {
      const ls = lschildren_(this);
      return (0 <= i ? ls[i] : ls[this.len() + i]) || null;
    };
    first = () => {
      return this.eq(0);
    };
    last = () => {
      return this.eq(-1);
    };
    isplaced = () => {
      let node = this;
      let d = this.root();

      while ((node = node.parent())) if (d === node) return true;

      return false;
    };
    has = (node) => {
      const p = node.parent();
      return p === this ? -1 !== lschildren_(p).indexOf(node) : false;
    };
    contains = (node) => {
      while ((node = node.parent())) if (this === node) return true;
      return false;
    };
    depth = () => {
      let i = 0;
      let node = this;

      if (this.isplaced()) for (; (node = node.parent()); i++);

      return i;
    };
    destroy = () => {
      "root parent children value id"
        .split(" ")
        .forEach((m) => (cc(this)[m] = none));

      delete cache_[this[__CACHEID__]];
      delete this[__CACHEID__];
    };
    toString = () => {
      return "" + this.value();
    };

    //
    path = (andSelf = true) => {
      let node = this;
      const p = andSelf ? [node] : [];
      //
      while ((node = node.parent())) p.push(node);
      //
      return p.reverse();
    };
    // travrse down, exit @onBreak
    walk = (callback, thisContext, onBreak = false) => {
      const node = this;
      walk_(node, { callback, thisContext, onBreak });
      return node;
    };
    // get first descendant that passes .callback
    find = (callback, thisContext, onBreak = false) => {
      //
      const match = { node: null };
      this.walk(find_, { match, callback, thisContext }, onBreak);

      return match.node;
    };
    //
    head = () => {
      let node = this;
      for (let p; (p = node.prev()); node = p);
      //
      return node;
    };
    //
    tail = () => {
      let node = this;
      for (let n; (n = node.next()); node = n);
      //
      return node;
    };
    //
    level = (andSelf = true) => {
      const pt = this.parent();
      const lvl = pt ? pt.ls() : [this];
      return andSelf ? lvl : lvl.filter((sibling) => sibling !== this);
    };
    //
    eachSibling = (callback, context, onBreak = false) => {
      loop_(this.level(false), callback, context, onBreak);
      //
      return this;
    };
    //
    isHead: () => {
      return this === this.head();
    },
    isTail: () => {
      return this === this.tail();
    },
  }

  class tree extends node {
    constructor(value = null) {
      super({ value });
      cc(this).root = this;

      /** private cache for each tree{} instance */
      idcache_[this[__CACHEID__]] = {};
    }
    node = (config = { id: none, value: none }) => {
      return new node({ ...config, root: this });
    };
    byid = (id) => {
      return getidcache_(this)[id] || null;
    };

    /*
      {
        fields..,
        children[]?
      }
      */
    json = (jsonObject, middleware = null) => {
      const fromRoot = { children: [jsonObject] };
      const context = {
        root: this,
        node: this,
        prev: [],
        middleware,
      };
      //
      traverseTree_(fromRoot, load_, context);
      //
      return this;
    };
  }

  return tree;

  /**
   * gets node's cache_
   * @param {node} node
   * @returns Object
   */
  function cc(node) {
    return cache_[node[__CACHEID__]];
  }
  function collector_(node) {
    push_(this, node);
    node.len() && node.lsa(this);
  }
  function traverser_(node, index) {
    this.callback.call(this.context, node, index);
    node.traverse(this.callback, this.context);
  }
  function query_(node, index) {
    if (true === this.callback.call(this.context, node, index))
      push_(this.list, node);
  }
  function lschildren_(node) {
    return cc(node).children;
  }
  function setParentNode_(node, ptnode) {
    cc(node).parent = ptnode;
  }
  function getid_(node) {
    return cc(node).id;
  }
  function getidcache_(treeNode) {
    return idcache_[treeNode[__CACHEID__]];
  }
  function loop_(list, callback, context, onBreak = false) {
    for (
      let i = 0, len = list.length;
      i < len && onBreak !== callback.call(context, list[i], i, list);
      i++
    );
  }
  function walk_(node, context) {
    let nextNode;
    const { callback, onBreak, thisContext } = context;
    //
    if (onBreak !== callback.call(thisContext, node)) {
      nextNode = 0 < node.len() ? node.eq(0) : node.next();
      if (nextNode) walk_(nextNode, context);
    }
  }
  function find_(node) {
    const { match, callback, thisContext } = this;
    if (true === callback.call(thisContext, node)) {
      match.node = node;
      return false;
    }
  }
  //
  function traverseTree_(node, callback, context = null) {
    if (!isEmpty_(node))
      forEach(node.children, traverserTree_, { callback, context });
    //
    return node;
  }
  function traverserTree_(node, index, coll) {
    this.callback.call(this.context, node, index, coll);
    traverseTree_(node, this.callback, this.context);
  }
  function isEmpty_(node) {
    return !node?.children?.length;
  }
  function omit_(object, ...fields) {
    return Object.keys(object).reduce((accum, key) => {
      if (!fields.includes(key)) accum[key] = object[key];
      //
      return accum;
    }, {});
  }
  function load_(json, index, list) {
    const { node, root, prev, middleware } = this;
    const ll = list.length;
    //
    const newNode = root.node({ value: omit_(json, "children") });
    node.append(newNode);
    //
    middleware && middleware.call(node, newNode, json);
    //
    if (!isEmpty_(json)) {
      if (1 < ll) prev.push(node);
      this.node = newNode;
      return;
    }
    //
    if (index === ll - 1) {
      this.node = prev.pop();
    }
  }
  function byClass_(node) {
    return node.hasClass(this.cls);
  }
})();

export default tree;
// module.exports = tree;
