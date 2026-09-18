var x = (l, i) => () => (i || l((i = { exports: {} }).exports, i), i.exports);

// lib/vendor/majiang/package/lib/rule.js
var N = x((Ii, D) => {
  "use strict";
  D.exports = function(l = {}) {
    let i = {
      /* 点数関連 */
      "\u914D\u7D66\u539F\u70B9": 25e3,
      "\u9806\u4F4D\u70B9": ["20.0", "10.0", "-10.0", "-20.0"],
      "\u9023\u98A8\u724C\u306F2\u7B26": false,
      /* 赤牌有無/クイタンなど */
      "\u8D64\u724C": { m: 1, p: 1, s: 1 },
      "\u30AF\u30A4\u30BF\u30F3\u3042\u308A": true,
      "\u55B0\u3044\u66FF\u3048\u8A31\u53EF\u30EC\u30D9\u30EB": 0,
      // 0: 喰い替えなし, 1: スジ喰い替えあり,  2: 現物喰い替えもあり
      /* 局数関連 */
      "\u5834\u6570": 2,
      // 0: 一局戦, 1: 東風戦, 2： 東南戦, 4: 一荘戦
      "\u9014\u4E2D\u6D41\u5C40\u3042\u308A": true,
      "\u6D41\u3057\u6E80\u8CAB\u3042\u308A": true,
      "\u30CE\u30FC\u30C6\u30F3\u5BA3\u8A00\u3042\u308A": false,
      "\u30CE\u30FC\u30C6\u30F3\u7F70\u3042\u308A": true,
      "\u6700\u5927\u540C\u6642\u548C\u4E86\u6570": 2,
      // 1: 頭ハネ, 2: ダブロンあり, 3: トリロンあり
      "\u9023\u8358\u65B9\u5F0F": 2,
      // 0: 連荘なし, 1: 和了連荘, 2: テンパイ連荘, 3: ノーテン連荘
      "\u30C8\u30D3\u7D42\u4E86\u3042\u308A": true,
      "\u30AA\u30FC\u30E9\u30B9\u6B62\u3081\u3042\u308A": true,
      "\u5EF6\u9577\u6226\u65B9\u5F0F": 1,
      // 0: 延長戦なし, 1: サドンデス, 2: 連荘優先サドンデス, 3: 4局固定
      /* リーチ/ドラ関連 */
      "\u4E00\u767A\u3042\u308A": true,
      "\u88CF\u30C9\u30E9\u3042\u308A": true,
      "\u30AB\u30F3\u30C9\u30E9\u3042\u308A": true,
      "\u30AB\u30F3\u88CF\u3042\u308A": true,
      "\u30AB\u30F3\u30C9\u30E9\u5F8C\u4E57\u305B": true,
      "\u30C4\u30E2\u756A\u306A\u3057\u30EA\u30FC\u30C1\u3042\u308A": false,
      "\u30EA\u30FC\u30C1\u5F8C\u6697\u69D3\u8A31\u53EF\u30EC\u30D9\u30EB": 2,
      // 0: 暗槓不可, 1: 牌姿の変わる暗槓不可, 2： 待ちの変わる暗槓不可
      /* 役満関連 */
      "\u5F79\u6E80\u306E\u8907\u5408\u3042\u308A": true,
      "\u30C0\u30D6\u30EB\u5F79\u6E80\u3042\u308A": true,
      "\u6570\u3048\u5F79\u6E80\u3042\u308A": true,
      "\u5F79\u6E80\u30D1\u30AA\u3042\u308A": true,
      "\u5207\u308A\u4E0A\u3052\u6E80\u8CAB\u3042\u308A": false
    };
    for (let t of Object.keys(l)) {
      i[t] = l[t];
    }
    return i;
  };
});

// lib/vendor/majiang/package/lib/shoupai.js
var E = x((Pi, F) => {
  "use strict";
  F.exports = class q {
    static valid_pai(i) {
      if (i.match(/^(?:[mps]\d|z[1-7])_?\*?[\+\=\-]?$/)) return i;
    }
    static valid_mianzi(i) {
      if (i.match(/^z.*[089]/)) return;
      let t = i.replace(/0/g, "5");
      if (t.match(/^[mpsz](\d)\1\1[\+\=\-]\1?$/)) {
        return i.replace(/([mps])05/, "$150");
      } else if (t.match(/^[mpsz](\d)\1\1\1[\+\=\-]?$/)) {
        return i[0] + i.match(/\d(?![\+\=\-])/g).sort().reverse().join("") + (i.match(/\d[\+\=\-]$/) || [""])[0];
      } else if (t.match(/^[mps]\d+\-\d*$/)) {
        let e = i.match(/0/);
        let n = t.match(/\d/g).sort();
        if (n.length != 3) return;
        if (+n[0] + 1 != +n[1] || +n[1] + 1 != +n[2]) return;
        t = t[0] + t.match(/\d[\+\=\-]?/g).sort().join("");
        return e ? t.replace(/5/, "0") : t;
      }
    }
    constructor(i = []) {
      this._bingpai = {
        _: 0,
        m: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        p: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        s: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        z: [0, 0, 0, 0, 0, 0, 0, 0]
      };
      this._fulou = [];
      this._zimo = null;
      this._lizhi = false;
      for (let t of i) {
        if (t == "_") {
          this._bingpai._++;
          continue;
        }
        if (!(t = q.valid_pai(t))) throw new Error(t);
        let e = t[0], n = +t[1];
        if (this._bingpai[e][n] == 4) throw new Error([this, t]);
        this._bingpai[e][n]++;
        if (e != "z" && n == 0) this._bingpai[e][5]++;
      }
    }
    static fromString(i = "") {
      let t = i.split(",");
      let e = t.shift();
      let n = e.match(/^_*/)[0].match(/_/g) || [];
      for (let u of e.match(/[mpsz]\d+_*/g) || []) {
        let r = u[0];
        for (let f of u.match(/\d/g)) {
          if (r == "z" && (f < 1 || 7 < f)) continue;
          n.push(r + f);
        }
        n = n.concat(u.match(/_/g) || []);
      }
      n = n.slice(0, 14 - t.filter((u) => u).length * 3);
      let a = n.length + t.length * 3 == 14 && n.slice(-1)[0];
      const s = new q(n);
      let h;
      for (let u of t) {
        if (!u) {
          s._zimo = h;
          break;
        }
        u = q.valid_mianzi(u);
        if (u) {
          s._fulou.push(u);
          h = u;
        }
      }
      s._zimo = s._zimo || a || null;
      s._lizhi = e.slice(-1) == "*";
      return s;
    }
    toString() {
      let i = "";
      for (let t of ["m", "p", "s", "z"]) {
        let e = t;
        let n = this._bingpai[t];
        let a = t == "z" ? 0 : n[0];
        for (let s = 1; s < n.length; s++) {
          let h = n[s];
          if (this._zimo) {
            if (t + s == this._zimo) {
              h--;
            }
            if (s == 5 && t + 0 == this._zimo) {
              h--;
              a--;
            }
          }
          for (let u = 0; u < h; u++) {
            if (s == 5 && a > 0) {
              e += 0;
              a--;
            } else {
              e += s;
            }
          }
        }
        if (e.length > 1) i += e;
      }
      i += "_".repeat(this._bingpai._ + (this._zimo == "_" ? -1 : 0));
      if (this._zimo && this._zimo.length <= 2) i += this._zimo;
      if (this._lizhi) i += "*";
      for (let t of this._fulou) {
        i += "," + t;
      }
      if (this._zimo && this._zimo.length > 2) i += ",";
      return i;
    }
    clone() {
      const i = new q();
      i._bingpai = {
        _: this._bingpai._,
        m: this._bingpai.m.concat(),
        p: this._bingpai.p.concat(),
        s: this._bingpai.s.concat(),
        z: this._bingpai.z.concat()
      };
      i._fulou = this._fulou.concat();
      i._zimo = this._zimo;
      i._lizhi = this._lizhi;
      return i;
    }
    fromString(i) {
      const t = q.fromString(i);
      this._bingpai = {
        _: t._bingpai._,
        m: t._bingpai.m.concat(),
        p: t._bingpai.p.concat(),
        s: t._bingpai.s.concat(),
        z: t._bingpai.z.concat()
      };
      this._fulou = t._fulou.concat();
      this._zimo = t._zimo;
      this._lizhi = t._lizhi;
      return this;
    }
    decrease(i, t) {
      let e = this._bingpai[i];
      t = +t;
      if (e[t] == 0 || t == 5 && e[0] == e[5]) {
        if (this._bingpai._ == 0) throw new Error([this, i + t]);
        this._bingpai._--;
      } else {
        e[t]--;
        if (t == 0) e[5]--;
      }
    }
    zimo(i, t = true) {
      if (t && this._zimo) throw new Error([this, i]);
      if (i == "_") {
        this._bingpai._++;
        this._zimo = i;
      } else {
        if (!q.valid_pai(i)) throw new Error(i);
        let e = i[0], n = +i[1];
        let a = this._bingpai[e];
        if (a[n] == 4) throw new Error([this, i]);
        a[n]++;
        if (n == 0) {
          if (a[5] == 4) throw new Error([this, i]);
          a[5]++;
        }
        this._zimo = e + n;
      }
      return this;
    }
    dapai(i, t = true) {
      if (t && !this._zimo) throw new Error([this, i]);
      if (!q.valid_pai(i)) throw new Error(i);
      let e = i[0], n = +i[1];
      this.decrease(e, n);
      this._zimo = null;
      if (i.slice(-1) == "*") this._lizhi = true;
      return this;
    }
    fulou(i, t = true) {
      if (t && this._zimo) throw new Error([this, i]);
      if (i != q.valid_mianzi(i)) throw new Error(i);
      if (i.match(/\d{4}$/)) throw new Error([this, i]);
      if (i.match(/\d{3}[\+\=\-]\d$/)) throw new Error([this, i]);
      let e = i[0];
      for (let n of i.match(/\d(?![\+\=\-])/g)) {
        this.decrease(e, n);
      }
      this._fulou.push(i);
      if (!i.match(/\d{4}/)) this._zimo = i;
      return this;
    }
    gang(i, t = true) {
      if (t && !this._zimo) throw new Error([this, i]);
      if (t && this._zimo.length > 2) throw new Error([this, i]);
      if (i != q.valid_mianzi(i)) throw new Error(i);
      let e = i[0];
      if (i.match(/\d{4}$/)) {
        for (let n of i.match(/\d/g)) {
          this.decrease(e, n);
        }
        this._fulou.push(i);
      } else if (i.match(/\d{3}[\+\=\-]\d$/)) {
        let n = i.slice(0, 5);
        let a = this._fulou.findIndex((s) => n == s);
        if (a < 0) throw new Error([this, i]);
        this._fulou[a] = i;
        this.decrease(e, i.slice(-1));
      } else throw new Error([this, i]);
      this._zimo = null;
      return this;
    }
    get menqian() {
      return this._fulou.filter((i) => i.match(/[\+\=\-]/)).length == 0;
    }
    get lizhi() {
      return this._lizhi;
    }
    get_dapai(i = true) {
      if (!this._zimo) return null;
      let t = {};
      if (i && this._zimo.length > 2) {
        let n = this._zimo;
        let a = n[0];
        let s = +n.match(/\d(?=[\+\=\-])/) || 5;
        t[a + s] = true;
        if (!n.replace(/0/, "5").match(/^[mpsz](\d)\1\1/)) {
          if (s < 7 && n.match(/^[mps]\d\-\d\d$/)) t[a + (s + 3)] = true;
          if (3 < s && n.match(/^[mps]\d\d\d\-$/)) t[a + (s - 3)] = true;
        }
      }
      let e = [];
      if (!this._lizhi) {
        for (let n of ["m", "p", "s", "z"]) {
          let a = this._bingpai[n];
          for (let s = 1; s < a.length; s++) {
            if (a[s] == 0) continue;
            if (t[n + s]) continue;
            if (n + s == this._zimo && a[s] == 1) continue;
            if (n == "z" || s != 5) e.push(n + s);
            else {
              if (a[0] > 0 && n + 0 != this._zimo || a[0] > 1)
                e.push(n + 0);
              if (a[0] < a[5]) e.push(n + s);
            }
          }
        }
      }
      if (this._zimo.length == 2) e.push(this._zimo + "_");
      return e;
    }
    get_chi_mianzi(i, t = true) {
      if (this._zimo) return null;
      if (!q.valid_pai(i)) throw new Error(i);
      let e = [];
      let n = i[0], a = +i[1] || 5, s = i.match(/[\+\=\-]$/);
      if (!s) throw new Error(i);
      if (n == "z" || s != "-") return e;
      if (this._lizhi) return e;
      let h = this._bingpai[n];
      if (3 <= a && h[a - 2] > 0 && h[a - 1] > 0) {
        if (!t || (3 < a ? h[a - 3] : 0) + h[a] < 14 - (this._fulou.length + 1) * 3) {
          if (a - 2 == 5 && h[0] > 0) e.push(n + "067-");
          if (a - 1 == 5 && h[0] > 0) e.push(n + "406-");
          if (a - 2 != 5 && a - 1 != 5 || h[0] < h[5])
            e.push(n + (a - 2) + (a - 1) + (i[1] + s));
        }
      }
      if (2 <= a && a <= 8 && h[a - 1] > 0 && h[a + 1] > 0) {
        if (!t || h[a] < 14 - (this._fulou.length + 1) * 3) {
          if (a - 1 == 5 && h[0] > 0) e.push(n + "06-7");
          if (a + 1 == 5 && h[0] > 0) e.push(n + "34-0");
          if (a - 1 != 5 && a + 1 != 5 || h[0] < h[5])
            e.push(n + (a - 1) + (i[1] + s) + (a + 1));
        }
      }
      if (a <= 7 && h[a + 1] > 0 && h[a + 2] > 0) {
        if (!t || h[a] + (a < 7 ? h[a + 3] : 0) < 14 - (this._fulou.length + 1) * 3) {
          if (a + 1 == 5 && h[0] > 0) e.push(n + "4-06");
          if (a + 2 == 5 && h[0] > 0) e.push(n + "3-40");
          if (a + 1 != 5 && a + 2 != 5 || h[0] < h[5])
            e.push(n + (i[1] + s) + (a + 1) + (a + 2));
        }
      }
      return e;
    }
    get_peng_mianzi(i) {
      if (this._zimo) return null;
      if (!q.valid_pai(i)) throw new Error(i);
      let t = [];
      let e = i[0], n = +i[1] || 5, a = i.match(/[\+\=\-]$/);
      if (!a) throw new Error(i);
      if (this._lizhi) return t;
      let s = this._bingpai[e];
      if (s[n] >= 2) {
        if (n == 5 && s[0] >= 2) t.push(e + "00" + i[1] + a);
        if (n == 5 && s[0] >= 1 && s[5] - s[0] >= 1)
          t.push(e + "50" + i[1] + a);
        if (n != 5 || s[5] - s[0] >= 2)
          t.push(e + n + n + i[1] + a);
      }
      return t;
    }
    get_gang_mianzi(i) {
      let t = [];
      if (i) {
        if (this._zimo) return null;
        if (!q.valid_pai(i)) throw new Error(i);
        let e = i[0], n = +i[1] || 5, a = i.match(/[\+\=\-]$/);
        if (!a) throw new Error(i);
        if (this._lizhi) return t;
        let s = this._bingpai[e];
        if (s[n] == 3) {
          if (n == 5) t = [e + "5".repeat(3 - s[0]) + "0".repeat(s[0]) + i[1] + a];
          else t = [e + n + n + n + n + a];
        }
      } else {
        if (!this._zimo) return null;
        if (this._zimo.length > 2) return null;
        let e = this._zimo.replace(/0/, "5");
        for (let n of ["m", "p", "s", "z"]) {
          let a = this._bingpai[n];
          for (let s = 1; s < a.length; s++) {
            if (a[s] == 0) continue;
            if (a[s] == 4) {
              if (this._lizhi && n + s != e) continue;
              if (s == 5) t.push(n + "5".repeat(4 - a[0]) + "0".repeat(a[0]));
              else t.push(n + s + s + s + s);
            } else {
              if (this._lizhi) continue;
              for (let h of this._fulou) {
                if (h.replace(/0/g, "5").slice(0, 4) == n + s + s + s) {
                  if (s == 5 && a[0] > 0) t.push(h + 0);
                  else t.push(h + s);
                }
              }
            }
          }
        }
      }
      return t;
    }
  };
});

// lib/vendor/majiang/package/lib/shan.js
var M = x((Fi, L) => {
  "use strict";
  var wi = { Shoupai: E() };
  L.exports = class Di {
    static zhenbaopai(i) {
      if (!wi.Shoupai.valid_pai(i)) throw new Error(i);
      let t = i[0], e = +i[1] || 5;
      return t == "z" ? e < 5 ? t + (e % 4 + 1) : t + ((e - 4) % 3 + 5) : t + (e % 9 + 1);
    }
    constructor(i) {
      this._rule = i;
      let t = i["\u8D64\u724C"];
      let e = [];
      for (let n of ["m", "p", "s", "z"]) {
        for (let a = 1; a <= (n == "z" ? 7 : 9); a++) {
          for (let s = 0; s < 4; s++) {
            if (a == 5 && s < t[n]) e.push(n + 0);
            else e.push(n + a);
          }
        }
      }
      this._pai = [];
      while (e.length) {
        this._pai.push(e.splice(Math.random() * e.length, 1)[0]);
      }
      this._baopai = [this._pai[4]];
      this._fubaopai = i["\u88CF\u30C9\u30E9\u3042\u308A"] ? [this._pai[9]] : null;
      this._weikaigang = false;
      this._closed = false;
    }
    zimo() {
      if (this._closed) throw new Error(this);
      if (this.paishu == 0) throw new Error(this);
      if (this._weikaigang) throw new Error(this);
      return this._pai.pop();
    }
    gangzimo() {
      if (this._closed) throw new Error(this);
      if (this.paishu == 0) throw new Error(this);
      if (this._weikaigang) throw new Error(this);
      if (this._baopai.length == 5) throw new Error(this);
      this._weikaigang = this._rule["\u30AB\u30F3\u30C9\u30E9\u3042\u308A"];
      if (!this._weikaigang) this._baopai.push("");
      return this._pai.shift();
    }
    kaigang() {
      if (this._closed) throw new Error(this);
      if (!this._weikaigang) throw new Error(this);
      this._baopai.push(this._pai[4]);
      if (this._fubaopai && this._rule["\u30AB\u30F3\u88CF\u3042\u308A"])
        this._fubaopai.push(this._pai[9]);
      this._weikaigang = false;
      return this;
    }
    close() {
      this._closed = true;
      return this;
    }
    get paishu() {
      return this._pai.length - 14;
    }
    get baopai() {
      return this._baopai.filter((i) => i);
    }
    get fubaopai() {
      return !this._closed ? null : this._fubaopai ? this._fubaopai.concat() : null;
    }
  };
});

// lib/vendor/majiang/package/lib/he.js
var O = x((Ai, C) => {
  "use strict";
  var A = { Shoupai: E() };
  C.exports = class Li {
    constructor() {
      this._pai = [];
      this._find = {};
    }
    dapai(i) {
      if (!A.Shoupai.valid_pai(i)) throw new Error(i);
      this._pai.push(i.replace(/[\+\=\-]$/, ""));
      this._find[i[0] + (+i[1] || 5)] = true;
      return this;
    }
    fulou(i) {
      if (!A.Shoupai.valid_mianzi(i)) throw new Error(i);
      let t = i[0] + i.match(/\d(?=[\+\=\-])/), e = i.match(/[\+\=\-]/);
      if (!e) throw new Error(i);
      if (this._pai[this._pai.length - 1].slice(0, 2) != t)
        throw new Error(i);
      this._pai[this._pai.length - 1] += e;
      return this;
    }
    find(i) {
      return this._find[i[0] + (+i[1] || 5)];
    }
  };
});

// lib/vendor/majiang/package/lib/board.js
var B = x((Ki, Q) => {
  "use strict";
  var K = {
    Shoupai: E(),
    He: O()
  };
  var T = class {
    constructor(i) {
      this.paishu = 136 - 13 * 4 - 14;
      this.baopai = [].concat(i || []);
      this.fubaopai;
    }
    zimo(i) {
      this.paishu--;
      return i || "_";
    }
    kaigang(i) {
      this.baopai.push(i);
    }
  };
  Q.exports = class Ci {
    constructor(i) {
      if (i) this.kaiju(i);
    }
    kaiju(i) {
      this.title = i.title;
      this.player = i.player;
      this.qijia = i.qijia;
      this.zhuangfeng = 0;
      this.jushu = 0;
      this.changbang = 0;
      this.lizhibang = 0;
      this.defen = [];
      this.shan = null;
      this.shoupai = [];
      this.he = [];
      this.player_id = [0, 1, 2, 3];
      this.lunban = -1;
      this._lizhi;
      this._fenpei;
      this._lianzhuang;
      this._changbang;
      this._lizhibang;
    }
    menfeng(i) {
      return (i + 4 - this.qijia + 4 - this.jushu) % 4;
    }
    qipai(i) {
      this.zhuangfeng = i.zhuangfeng;
      this.jushu = i.jushu;
      this.changbang = i.changbang;
      this.lizhibang = i.lizhibang;
      this.shan = new T(i.baopai);
      for (let t = 0; t < 4; t++) {
        let e = i.shoupai[t] || "_".repeat(13);
        this.shoupai[t] = K.Shoupai.fromString(e);
        this.he[t] = new K.He();
        this.player_id[t] = (this.qijia + this.jushu + t) % 4;
        this.defen[this.player_id[t]] = i.defen[t];
      }
      this.lunban = -1;
      this._lizhi = false;
      this._fenpei = null;
      this._changbang = i.changbang;
      this._lizhibang = i.lizhibang;
    }
    lizhi() {
      if (this._lizhi) {
        this.defen[this.player_id[this.lunban]] -= 1e3;
        this.lizhibang++;
        this._lizhi = false;
      }
    }
    zimo(i) {
      this.lizhi();
      this.lunban = i.l;
      this.shoupai[i.l].zimo(this.shan.zimo(i.p), false);
    }
    dapai(i) {
      this.lunban = i.l;
      this.shoupai[i.l].dapai(i.p, false);
      this.he[i.l].dapai(i.p);
      this._lizhi = i.p.slice(-1) == "*";
    }
    fulou(i) {
      this.lizhi();
      this.he[this.lunban].fulou(i.m);
      this.lunban = i.l;
      this.shoupai[i.l].fulou(i.m, false);
    }
    gang(i) {
      this.lunban = i.l;
      this.shoupai[i.l].gang(i.m, false);
    }
    kaigang(i) {
      this.shan.kaigang(i.baopai);
    }
    hule(i) {
      let t = this.shoupai[i.l];
      t.fromString(i.shoupai);
      if (i.baojia != null) t.dapai(t.get_dapai().pop());
      if (this._fenpei) {
        this.changbang = 0;
        this.lizhibang = 0;
        for (let e = 0; e < 4; e++) {
          this.defen[this.player_id[e]] += this._fenpei[e];
        }
      }
      this.shan.fubaopai = i.fubaopai;
      this._fenpei = i.fenpei;
      this._lizhibang = 0;
      if (i.l == 0) this._lianzhuang = true;
    }
    pingju(i) {
      if (!i.name.match(/^三家和/)) this.lizhi();
      for (let t = 0; t < 4; t++) {
        if (i.shoupai[t])
          this.shoupai[t].fromString(i.shoupai[t]);
      }
      this._fenpei = i.fenpei;
      this._lizhibang = this.lizhibang;
      this._lianzhuang = true;
    }
    last() {
      if (!this._fenpei) return;
      this.changbang = this._lianzhuang ? this._changbang + 1 : 0;
      this.lizhibang = this._lizhibang;
      for (let i = 0; i < 4; i++) {
        this.defen[this.player_id[i]] += this._fenpei[i];
      }
    }
    jieju(i) {
      for (let t = 0; t < 4; t++) {
        this.defen[t] = i.defen[t];
      }
      this.lunban = -1;
    }
  };
});

// lib/vendor/majiang/package/lib/xiangting.js
var G = x((Qi, ii) => {
  "use strict";
  function ji(l, i, t, e) {
    let n = e ? 4 : 5;
    if (l > 4) {
      i += l - 4;
      l = 4;
    }
    if (l + i > 4) {
      t += l + i - 4;
      i = 4 - l;
    }
    if (l + i + t > n) {
      t = n - l - i;
    }
    if (e) i++;
    return 13 - l * 3 - i * 2 - t;
  }
  function qi(l) {
    let i = 0, t = 0, e = 0;
    for (let n = 1; n <= 9; n++) {
      i += l[n];
      if (n <= 7 && l[n + 1] == 0 && l[n + 2] == 0) {
        t += i >> 1;
        e += i % 2;
        i = 0;
      }
    }
    t += i >> 1;
    e += i % 2;
    return {
      a: [0, t, e],
      b: [0, t, e]
    };
  }
  function $(l, i = 1) {
    if (i > 9) return qi(l);
    let t = $(l, i + 1);
    if (i <= 7 && l[i] > 0 && l[i + 1] > 0 && l[i + 2] > 0) {
      l[i]--;
      l[i + 1]--;
      l[i + 2]--;
      let e = $(l, i);
      l[i]++;
      l[i + 1]++;
      l[i + 2]++;
      e.a[0]++;
      e.b[0]++;
      if (e.a[2] < t.a[2] || e.a[2] == t.a[2] && e.a[1] < t.a[1]) t.a = e.a;
      if (e.b[0] > t.b[0] || e.b[0] == t.b[0] && e.b[1] > t.b[1]) t.b = e.b;
    }
    if (l[i] >= 3) {
      l[i] -= 3;
      let e = $(l, i + 1);
      l[i] += 3;
      e.a[0]++;
      e.b[0]++;
      if (e.a[2] < t.a[2] || e.a[2] == t.a[2] && e.a[1] < t.a[1]) t.a = e.a;
      if (e.b[0] > t.b[0] || e.b[0] == t.b[0] && e.b[1] > t.b[1]) t.b = e.b;
    }
    return t;
  }
  function V(l, i) {
    let t = {
      m: $(l._bingpai.m),
      p: $(l._bingpai.p),
      s: $(l._bingpai.s)
    };
    let e = [0, 0, 0];
    for (let s = 1; s <= 7; s++) {
      if (l._bingpai.z[s] >= 3) e[0]++;
      else if (l._bingpai.z[s] == 2) e[1]++;
      else if (l._bingpai.z[s] == 1) e[2]++;
    }
    let n = l._fulou.length;
    let a = 13;
    for (let s of [t.m.a, t.m.b]) {
      for (let h of [t.p.a, t.p.b]) {
        for (let u of [t.s.a, t.s.b]) {
          let r = [n, 0, 0];
          for (let c = 0; c < 3; c++) {
            r[c] += s[c] + h[c] + u[c] + e[c];
          }
          let f = ji(r[0], r[1], r[2], i);
          if (f < a) a = f;
        }
      }
    }
    return a;
  }
  function W(l) {
    let i = V(l);
    for (let t of ["m", "p", "s", "z"]) {
      let e = l._bingpai[t];
      for (let n = 1; n < e.length; n++) {
        if (e[n] >= 2) {
          e[n] -= 2;
          let a = V(l, true);
          e[n] += 2;
          if (a < i) i = a;
        }
      }
    }
    if (i == -1 && l._zimo && l._zimo.length > 2) return 0;
    return i;
  }
  function X(l) {
    if (l._fulou.length) return Infinity;
    let i = 0;
    let t = 0;
    for (let e of ["m", "p", "s", "z"]) {
      let n = l._bingpai[e];
      let a = e == "z" ? [1, 2, 3, 4, 5, 6, 7] : [1, 9];
      for (let s of a) {
        if (n[s] >= 1) i++;
        if (n[s] >= 2) t++;
      }
    }
    return t ? 12 - i : 13 - i;
  }
  function Y(l) {
    if (l._fulou.length) return Infinity;
    let i = 0;
    let t = 0;
    for (let e of ["m", "p", "s", "z"]) {
      let n = l._bingpai[e];
      for (let a = 1; a < n.length; a++) {
        if (n[a] >= 2) i++;
        else if (n[a] == 1) t++;
      }
    }
    if (i > 7) i = 7;
    if (i + t > 7) t = 7 - i;
    return 13 - i * 2 - t;
  }
  function Z(l) {
    return Math.min(
      W(l),
      X(l),
      Y(l)
    );
  }
  function ki(l, i = Z) {
    if (l._zimo) return null;
    let t = [];
    let e = i(l);
    for (let n of ["m", "p", "s", "z"]) {
      let a = l._bingpai[n];
      for (let s = 1; s < a.length; s++) {
        if (a[s] >= 4) continue;
        a[s]++;
        if (i(l) < e) t.push(n + s);
        a[s]--;
      }
    }
    return t;
  }
  ii.exports = {
    xiangting_guoshi: X,
    xiangting_qidui: Y,
    xiangting_yiban: W,
    xiangting: Z,
    tingpai: ki
  };
});

// lib/vendor/majiang/package/lib/hule.js
var R = x((Vi, ei) => {
  "use strict";
  var I = {
    Shan: M(),
    rule: N()
  };
  function H(l, i, t = 1) {
    if (t > 9) return [[]];
    if (i[t] == 0) return H(l, i, t + 1);
    let e = [];
    if (t <= 7 && i[t] > 0 && i[t + 1] > 0 && i[t + 2] > 0) {
      i[t]--;
      i[t + 1]--;
      i[t + 2]--;
      e = H(l, i, t);
      i[t]++;
      i[t + 1]++;
      i[t + 2]++;
      for (let a of e) {
        a.unshift(l + t + (t + 1) + (t + 2));
      }
    }
    let n = [];
    if (i[t] == 3) {
      i[t] -= 3;
      n = H(l, i, t + 1);
      i[t] += 3;
      for (let a of n) {
        a.unshift(l + t + t + t);
      }
    }
    return e.concat(n);
  }
  function vi(l) {
    let i = [[]];
    for (let n of ["m", "p", "s"]) {
      let a = [];
      for (let s of i) {
        for (let h of H(n, l._bingpai[n])) {
          a.push(s.concat(h));
        }
      }
      i = a;
    }
    let t = [];
    for (let n = 1; n <= 7; n++) {
      if (l._bingpai.z[n] == 0) continue;
      if (l._bingpai.z[n] != 3) return [];
      t.push("z" + n + n + n);
    }
    let e = l._fulou.map((n) => n.replace(/0/g, "5"));
    return i.map((n) => n.concat(t).concat(e));
  }
  function xi(l, i) {
    let [t, e, n] = i;
    let a = new RegExp(`^(${t}.*${e})`);
    let s = `$1${n}!`;
    let h = [];
    for (let u = 0; u < l.length; u++) {
      if (l[u].match(/[\+\=\-]|\d{4}/)) continue;
      if (u > 0 && l[u] == l[u - 1]) continue;
      let r = l[u].replace(a, s);
      if (r == l[u]) continue;
      let f = l.concat();
      f[u] = r;
      h.push(f);
    }
    return h;
  }
  function Si(l, i) {
    let t = [];
    for (let e of ["m", "p", "s", "z"]) {
      let n = l._bingpai[e];
      for (let a = 1; a < n.length; a++) {
        if (n[a] < 2) continue;
        n[a] -= 2;
        let s = e + a + a;
        for (let h of vi(l)) {
          h.unshift(s);
          if (h.length != 5) continue;
          t = t.concat(xi(h, i));
        }
        n[a] += 2;
      }
    }
    return t;
  }
  function Ei(l, i) {
    if (l._fulou.length > 0) return [];
    let t = [];
    for (let e of ["m", "p", "s", "z"]) {
      let n = l._bingpai[e];
      for (let a = 1; a < n.length; a++) {
        if (n[a] == 0) continue;
        if (n[a] == 2) {
          let s = e + a == i.slice(0, 2) ? e + a + a + i[2] + "!" : e + a + a;
          t.push(s);
        } else return [];
      }
    }
    return t.length == 7 ? [t] : [];
  }
  function $i(l, i) {
    if (l._fulou.length > 0) return [];
    let t = [];
    let e = 0;
    for (let n of ["m", "p", "s", "z"]) {
      let a = l._bingpai[n];
      let s = n == "z" ? [1, 2, 3, 4, 5, 6, 7] : [1, 9];
      for (let h of s) {
        if (a[h] == 2) {
          let u = n + h == i.slice(0, 2) ? n + h + h + i[2] + "!" : n + h + h;
          t.unshift(u);
          e++;
        } else if (a[h] == 1) {
          let u = n + h == i.slice(0, 2) ? n + h + i[2] + "!" : n + h;
          t.push(u);
        } else return [];
      }
    }
    return e == 1 ? [t] : [];
  }
  function Ui(l, i) {
    if (l._fulou.length > 0) return [];
    let t = i[0];
    if (t == "z") return [];
    let e = t;
    let n = l._bingpai[t];
    for (let a = 1; a <= 9; a++) {
      if (n[a] == 0) return [];
      if ((a == 1 || a == 9) && n[a] < 3) return [];
      let s = a == i[1] ? n[a] - 1 : n[a];
      for (let h = 0; h < s; h++) {
        e += a;
      }
    }
    if (e.length != 14) return [];
    e += i.slice(1) + "!";
    return [[e]];
  }
  function ti(l, i) {
    let t = l.clone();
    if (i) t.zimo(i);
    if (!t._zimo || t._zimo.length > 2) return [];
    let e = (i || t._zimo + "_").replace(/0/, "5");
    return [].concat(Si(t, e)).concat(Ei(t, e)).concat($i(t, e)).concat(Ui(t, e));
  }
  function Oi(l, i, t, e) {
    const n = new RegExp(`^z${i + 1}.*$`);
    const a = new RegExp(`^z${t + 1}.*$`);
    const s = /^z[567].*$/;
    const h = /^.*[z19].*$/;
    const u = /^z.*$/;
    const r = /^[mpsz](\d)\1\1.*$/;
    const f = /^[mpsz](\d)\1\1(?:\1|_\!)?$/;
    const c = /^[mpsz](\d)\1\1.*\1.*$/;
    const b = /^[mpsz](\d)\1[\+\=\-\_]\!$/;
    const y = /^[mps]\d\d[\+\=\-\_]\!\d$/;
    const d = /^[mps](123[\+\=\-\_]\!|7[\+\=\-\_]\!89)$/;
    let _ = {
      fu: 20,
      menqian: true,
      zimo: true,
      shunzi: {
        m: [0, 0, 0, 0, 0, 0, 0, 0],
        p: [0, 0, 0, 0, 0, 0, 0, 0],
        s: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      kezi: {
        m: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        p: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        s: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        z: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      n_shunzi: 0,
      n_kezi: 0,
      n_ankezi: 0,
      n_gangzi: 0,
      n_yaojiu: 0,
      n_zipai: 0,
      danqi: false,
      pinghu: false,
      zhuangfeng: i,
      menfeng: t
    };
    for (let p of l) {
      if (p.match(/[\+\=\-](?!\!)/)) _.menqian = false;
      if (p.match(/[\+\=\-]\!/)) _.zimo = false;
      if (l.length == 1) continue;
      if (p.match(b)) _.danqi = true;
      if (l.length == 13) continue;
      if (p.match(h)) _.n_yaojiu++;
      if (p.match(u)) _.n_zipai++;
      if (l.length != 5) continue;
      if (p == l[0]) {
        let z = 0;
        if (p.match(n)) z += 2;
        if (p.match(a)) z += 2;
        if (p.match(s)) z += 2;
        z = e["\u9023\u98A8\u724C\u306F2\u7B26"] && z > 2 ? 2 : z;
        _.fu += z;
        if (_.danqi) _.fu += 2;
      } else if (p.match(r)) {
        _.n_kezi++;
        let z = 2;
        if (p.match(h)) {
          z *= 2;
        }
        if (p.match(f)) {
          z *= 2;
          _.n_ankezi++;
        }
        if (p.match(c)) {
          z *= 4;
          _.n_gangzi++;
        }
        _.fu += z;
        _.kezi[p[0]][p[1]]++;
      } else {
        _.n_shunzi++;
        if (p.match(y)) _.fu += 2;
        if (p.match(d)) _.fu += 2;
        _.shunzi[p[0]][p[1]]++;
      }
    }
    if (l.length == 7) {
      _.fu = 25;
    } else if (l.length == 5) {
      _.pinghu = _.menqian && _.fu == 20;
      if (_.zimo) {
        if (!_.pinghu) _.fu += 2;
      } else {
        if (_.menqian) _.fu += 10;
        else if (_.fu == 20) _.fu = 30;
      }
      _.fu = Math.ceil(_.fu / 10) * 10;
    }
    return _;
  }
  function Ji(l) {
    let i = [];
    if (l.lizhi == 1) i.push({ name: "\u7ACB\u76F4", fanshu: 1 });
    if (l.lizhi == 2) i.push({ name: "\u30C0\u30D6\u30EB\u7ACB\u76F4", fanshu: 2 });
    if (l.yifa) i.push({ name: "\u4E00\u767A", fanshu: 1 });
    if (l.haidi == 1) i.push({ name: "\u6D77\u5E95\u6478\u6708", fanshu: 1 });
    if (l.haidi == 2) i.push({ name: "\u6CB3\u5E95\u6488\u9B5A", fanshu: 1 });
    if (l.lingshang) i.push({ name: "\u5DBA\u4E0A\u958B\u82B1", fanshu: 1 });
    if (l.qianggang) i.push({ name: "\u69CD\u69D3", fanshu: 1 });
    if (l.tianhu == 1) i = [{ name: "\u5929\u548C", fanshu: "*" }];
    if (l.tianhu == 2) i = [{ name: "\u5730\u548C", fanshu: "*" }];
    return i;
  }
  function Ni(l, i, t, e, n) {
    function a() {
      if (i.menqian && i.zimo)
        return [{ name: "\u9580\u524D\u6E05\u81EA\u6478\u548C", fanshu: 1 }];
      return [];
    }
    function s() {
      let o = ["\u6771", "\u5357", "\u897F", "\u5317"];
      let g = [];
      if (i.kezi.z[i.zhuangfeng + 1])
        g.push({
          name: "\u5834\u98A8 " + o[i.zhuangfeng],
          fanshu: 1
        });
      if (i.kezi.z[i.menfeng + 1])
        g.push({
          name: "\u81EA\u98A8 " + o[i.menfeng],
          fanshu: 1
        });
      if (i.kezi.z[5]) g.push({ name: "\u7FFB\u724C \u767D", fanshu: 1 });
      if (i.kezi.z[6]) g.push({ name: "\u7FFB\u724C \u767C", fanshu: 1 });
      if (i.kezi.z[7]) g.push({ name: "\u7FFB\u724C \u4E2D", fanshu: 1 });
      return g;
    }
    function h() {
      if (i.pinghu) return [{ name: "\u5E73\u548C", fanshu: 1 }];
      return [];
    }
    function u() {
      if (i.n_yaojiu > 0) return [];
      if (n["\u30AF\u30A4\u30BF\u30F3\u3042\u308A"] || i.menqian)
        return [{ name: "\u65AD\u5E7A\u4E5D", fanshu: 1 }];
      return [];
    }
    function r() {
      if (!i.menqian) return [];
      const o = i.shunzi;
      let g = o.m.concat(o.p).concat(o.s).map((j) => j >> 1).reduce((j, S) => j + S);
      if (g == 1) return [{ name: "\u4E00\u76C3\u53E3", fanshu: 1 }];
      return [];
    }
    function f() {
      const o = i.shunzi;
      for (let g = 1; g <= 7; g++) {
        if (o.m[g] && o.p[g] && o.s[g])
          return [{ name: "\u4E09\u8272\u540C\u9806", fanshu: i.menqian ? 2 : 1 }];
      }
      return [];
    }
    function c() {
      const o = i.shunzi;
      for (let g of ["m", "p", "s"]) {
        if (o[g][1] && o[g][4] && o[g][7])
          return [{ name: "\u4E00\u6C17\u901A\u8CAB", fanshu: i.menqian ? 2 : 1 }];
      }
      return [];
    }
    function b() {
      if (i.n_yaojiu == 5 && i.n_shunzi > 0 && i.n_zipai > 0)
        return [{ name: "\u6DF7\u5168\u5E2F\u5E7A\u4E5D", fanshu: i.menqian ? 2 : 1 }];
      return [];
    }
    function y() {
      if (l.length == 7) return [{ name: "\u4E03\u5BFE\u5B50", fanshu: 2 }];
      return [];
    }
    function d() {
      if (i.n_kezi == 4) return [{ name: "\u5BFE\u3005\u548C", fanshu: 2 }];
      return [];
    }
    function _() {
      if (i.n_ankezi == 3) return [{ name: "\u4E09\u6697\u523B", fanshu: 2 }];
      return [];
    }
    function p() {
      if (i.n_gangzi == 3) return [{ name: "\u4E09\u69D3\u5B50", fanshu: 2 }];
      return [];
    }
    function z() {
      const o = i.kezi;
      for (let g = 1; g <= 9; g++) {
        if (o.m[g] && o.p[g] && o.s[g])
          return [{ name: "\u4E09\u8272\u540C\u523B", fanshu: 2 }];
      }
      return [];
    }
    function w() {
      if (i.n_yaojiu == l.length && i.n_shunzi == 0 && i.n_zipai > 0)
        return [{ name: "\u6DF7\u8001\u982D", fanshu: 2 }];
      return [];
    }
    function hi() {
      const o = i.kezi;
      if (o.z[5] + o.z[6] + o.z[7] == 2 && l[0].match(/^z[567]/))
        return [{ name: "\u5C0F\u4E09\u5143", fanshu: 2 }];
      return [];
    }
    function ui() {
      for (let o of ["m", "p", "s"]) {
        const g = new RegExp(`^[z${o}]`);
        if (l.filter((j) => j.match(g)).length == l.length && i.n_zipai > 0)
          return [{ name: "\u6DF7\u4E00\u8272", fanshu: i.menqian ? 3 : 2 }];
      }
      return [];
    }
    function ri() {
      if (i.n_yaojiu == 5 && i.n_shunzi > 0 && i.n_zipai == 0)
        return [{ name: "\u7D14\u5168\u5E2F\u5E7A\u4E5D", fanshu: i.menqian ? 3 : 2 }];
      return [];
    }
    function fi() {
      if (!i.menqian) return [];
      const o = i.shunzi;
      let g = o.m.concat(o.p).concat(o.s).map((j) => j >> 1).reduce((j, S) => j + S);
      if (g == 2) return [{ name: "\u4E8C\u76C3\u53E3", fanshu: 3 }];
      return [];
    }
    function oi() {
      for (let o of ["m", "p", "s"]) {
        const g = new RegExp(`^[${o}]`);
        if (l.filter((j) => j.match(g)).length == l.length)
          return [{ name: "\u6E05\u4E00\u8272", fanshu: i.menqian ? 6 : 5 }];
      }
      return [];
    }
    function _i() {
      if (l.length != 13) return [];
      if (i.danqi) return [{ name: "\u56FD\u58EB\u7121\u53CC\u5341\u4E09\u9762", fanshu: "**" }];
      else return [{ name: "\u56FD\u58EB\u7121\u53CC", fanshu: "*" }];
    }
    function gi() {
      if (i.n_ankezi != 4) return [];
      if (i.danqi) return [{ name: "\u56DB\u6697\u523B\u5358\u9A0E", fanshu: "**" }];
      else return [{ name: "\u56DB\u6697\u523B", fanshu: "*" }];
    }
    function pi() {
      const o = i.kezi;
      if (o.z[5] + o.z[6] + o.z[7] == 3) {
        let g = l.filter((S) => S.match(/^z([567])\1\1(?:[\+\=\-]|\1)(?!\!)/));
        let j = g[2] && g[2].match(/[\+\=\-]/);
        if (j)
          return [{ name: "\u5927\u4E09\u5143", fanshu: "*", baojia: j[0] }];
        else return [{ name: "\u5927\u4E09\u5143", fanshu: "*" }];
      }
      return [];
    }
    function ci() {
      const o = i.kezi;
      if (o.z[1] + o.z[2] + o.z[3] + o.z[4] == 4) {
        let g = l.filter((S) => S.match(/^z([1234])\1\1(?:[\+\=\-]|\1)(?!\!)/));
        let j = g[3] && g[3].match(/[\+\=\-]/);
        if (j)
          return [{ name: "\u5927\u56DB\u559C", fanshu: "**", baojia: j[0] }];
        else return [{ name: "\u5927\u56DB\u559C", fanshu: "**" }];
      }
      if (o.z[1] + o.z[2] + o.z[3] + o.z[4] == 3 && l[0].match(/^z[1234]/))
        return [{ name: "\u5C0F\u56DB\u559C", fanshu: "*" }];
      return [];
    }
    function mi() {
      if (i.n_zipai == l.length)
        return [{ name: "\u5B57\u4E00\u8272", fanshu: "*" }];
      return [];
    }
    function zi() {
      if (l.filter((o) => o.match(/^[mp]/)).length > 0) return [];
      if (l.filter((o) => o.match(/^z[^6]/)).length > 0) return [];
      if (l.filter((o) => o.match(/^s.*[1579]/)).length > 0) return [];
      return [{ name: "\u7DD1\u4E00\u8272", fanshu: "*" }];
    }
    function di() {
      if (i.n_yaojiu == 5 && i.n_kezi == 4 && i.n_zipai == 0)
        return [{ name: "\u6E05\u8001\u982D", fanshu: "*" }];
      return [];
    }
    function bi() {
      if (i.n_gangzi == 4) return [{ name: "\u56DB\u69D3\u5B50", fanshu: "*" }];
      return [];
    }
    function yi() {
      if (l.length != 1) return [];
      if (l[0].match(/^[mpsz]1112345678999/))
        return [{ name: "\u7D14\u6B63\u4E5D\u84EE\u5B9D\u71C8", fanshu: "**" }];
      else return [{ name: "\u4E5D\u84EE\u5B9D\u71C8", fanshu: "*" }];
    }
    let U = t.length > 0 && t[0].fanshu[0] == "*" ? t : [];
    U = U.concat(_i()).concat(gi()).concat(pi()).concat(ci()).concat(mi()).concat(zi()).concat(di()).concat(bi()).concat(yi());
    for (let o of U) {
      if (!n["\u30C0\u30D6\u30EB\u5F79\u6E80\u3042\u308A"]) o.fanshu = "*";
      if (!n["\u5F79\u6E80\u30D1\u30AA\u3042\u308A"]) delete o.baojia;
    }
    if (U.length > 0) return U;
    let J = t.concat(a()).concat(s()).concat(h()).concat(u()).concat(r()).concat(f()).concat(c()).concat(b()).concat(y()).concat(d()).concat(_()).concat(p()).concat(z()).concat(w()).concat(hi()).concat(ui()).concat(ri()).concat(fi()).concat(oi());
    if (J.length > 0) J = J.concat(e);
    return J;
  }
  function Mi(l, i, t, e) {
    let n = l.clone();
    if (i) n.zimo(i);
    let a = n.toString();
    let s = [];
    let h = a.match(/[mpsz][^mpsz,]*/g);
    let u = 0;
    for (let b of t) {
      b = I.Shan.zhenbaopai(b);
      const y = new RegExp(b[1], "g");
      for (let d of h) {
        if (d[0] != b[0]) continue;
        d = d.replace(/0/, "5");
        let _ = d.match(y);
        if (_) u += _.length;
      }
    }
    if (u) s.push({ name: "\u30C9\u30E9", fanshu: u });
    let r = 0;
    let f = a.match(/0/g);
    if (f) r = f.length;
    if (r) s.push({ name: "\u8D64\u30C9\u30E9", fanshu: r });
    let c = 0;
    for (let b of e || []) {
      b = I.Shan.zhenbaopai(b);
      const y = new RegExp(b[1], "g");
      for (let d of h) {
        if (d[0] != b[0]) continue;
        d = d.replace(/0/, "5");
        let _ = d.match(y);
        if (_) c += _.length;
      }
    }
    if (c) s.push({ name: "\u88CF\u30C9\u30E9", fanshu: c });
    return s;
  }
  function Gi(l, i, t, e) {
    if (i.length == 0) return { defen: 0 };
    let n = e.menfeng;
    let a, s, h, u, r, f, c, b;
    if (i[0].fanshu[0] == "*") {
      l = void 0;
      s = !e.rule["\u5F79\u6E80\u306E\u8907\u5408\u3042\u308A"] ? 1 : i.map((z) => z.fanshu.length).reduce((z, w) => z + w);
      u = 8e3 * s;
      let p = i.find((z) => z.baojia);
      if (p) {
        b = (n + { "+": 1, "=": 2, "-": 3 }[p.baojia]) % 4;
        c = 8e3 * Math.min(p.fanshu.length, s);
      }
    } else {
      a = i.map((p) => p.fanshu).reduce((p, z) => p + z);
      u = a >= 13 && e.rule["\u6570\u3048\u5F79\u6E80\u3042\u308A"] ? 8e3 : a >= 11 ? 6e3 : a >= 8 ? 4e3 : a >= 6 ? 3e3 : e.rule["\u5207\u308A\u4E0A\u3052\u6E80\u8CAB\u3042\u308A"] && l << 2 + a == 1920 ? 2e3 : Math.min(l << 2 + a, 2e3);
    }
    let y = [0, 0, 0, 0];
    let d = e.jicun.changbang;
    let _ = e.jicun.lizhibang;
    if (b != null) {
      if (t) c = c / 2;
      u = u - c;
      f = c * (n == 0 ? 6 : 4);
      y[n] += f;
      y[b] -= f;
    } else f = 0;
    if (t || u == 0) {
      r = u == 0 ? b : (n + { "+": 1, "=": 2, "-": 3 }[t[2]]) % 4;
      h = Math.ceil(u * (n == 0 ? 6 : 4) / 100) * 100;
      y[n] += h + d * 300 + _ * 1e3;
      y[r] -= h + d * 300;
    } else {
      let p = Math.ceil(u * 2 / 100) * 100;
      let z = Math.ceil(u / 100) * 100;
      if (n == 0) {
        h = p * 3;
        for (let w = 0; w < 4; w++) {
          if (w == n)
            y[w] += h + d * 300 + _ * 1e3;
          else y[w] -= p + d * 100;
        }
      } else {
        h = p + z * 2;
        for (let w = 0; w < 4; w++) {
          if (w == n)
            y[w] += h + d * 300 + _ * 1e3;
          else if (w == 0)
            y[w] -= p + d * 100;
          else y[w] -= z + d * 100;
        }
      }
    }
    return {
      hupai: i,
      fu: l,
      fanshu: a,
      damanguan: s,
      defen: h + f,
      fenpei: y
    };
  }
  function Hi(l, i, t) {
    if (i) {
      if (!i.match(/[\+\=\-]$/)) throw new Error(i);
      i = i.slice(0, 2) + i.slice(-1);
    }
    let e;
    let n = Ji(t.hupai);
    let a = Mi(
      l,
      i,
      t.baopai,
      t.fubaopai
    );
    for (let s of ti(l, i)) {
      let h = Oi(
        s,
        t.zhuangfeng,
        t.menfeng,
        t.rule
      );
      let u = Ni(s, h, n, a, t.rule);
      let r = Gi(h.fu, u, i, t);
      if (!e || r.defen > e.defen || r.defen == e.defen && (!r.fanshu || r.fanshu > e.fanshu || r.fanshu == e.fanshu && r.fu > e.fu)) e = r;
    }
    return e;
  }
  function Ri(l = {}) {
    let i = {
      rule: l.rule ?? I.rule(),
      zhuangfeng: l.zhuangfeng ?? 0,
      menfeng: l.menfeng ?? 1,
      hupai: {
        lizhi: l.lizhi ?? 0,
        yifa: l.yifa ?? false,
        qianggang: l.qianggang ?? false,
        lingshang: l.lingshang ?? false,
        haidi: l.haidi ?? 0,
        tianhu: l.tianhu ?? 0
      },
      baopai: l.baopai ? [].concat(l.baopai) : [],
      fubaopai: l.fubaopai ? [].concat(l.fubaopai) : null,
      jicun: {
        changbang: l.changbang ?? 0,
        lizhibang: l.lizhibang ?? 0
      }
    };
    return i;
  }
  ei.exports = {
    hule: Hi,
    hule_param: Ri,
    hule_mianzi: ti
  };
});

// lib/vendor/majiang/package/lib/game.js
var P = x((Wi, ni) => {
  "use strict";
  var m = {
    rule: N(),
    Shoupai: E(),
    Shan: M(),
    He: O(),
    Util: Object.assign(
      G(),
      R()
    )
  };
  ni.exports = class k {
    constructor(i, t, e, n) {
      this._players = i;
      this._callback = t || (() => {
      });
      this._rule = e || m.rule();
      this._model = {
        title: n || "\u96FB\u8133\u9EBB\u5C06\n" + (/* @__PURE__ */ new Date()).toLocaleString(),
        player: ["\u79C1", "\u4E0B\u5BB6", "\u5BFE\u9762", "\u4E0A\u5BB6"],
        qijia: 0,
        zhuangfeng: 0,
        jushu: 0,
        changbang: 0,
        lizhibang: 0,
        defen: [0, 0, 0, 0].map((a) => this._rule["\u914D\u7D66\u539F\u70B9"]),
        shan: null,
        shoupai: [],
        he: [],
        player_id: [0, 1, 2, 3]
      };
      this._view;
      this._status;
      this._reply = [];
      this._sync = false;
      this._stop = null;
      this._dwell = 0;
      this._wait = 0;
      this._timeout_id;
      this._handler;
      this._speed = 3;
    }
    get model() {
      return this._model;
    }
    set view(i) {
      this._view = i;
    }
    get view() {
      return this._view;
    }
    set dwell(i) {
      this._dwell = i;
    }
    set wait(i) {
      this._wait = i;
    }
    set handler(i) {
      this._handler = i;
    }
    get speed() {
      return this._speed;
    }
    set speed(i) {
      this._speed = i;
      this.dwell = i * 200;
    }
    add_paipu(i) {
      this._paipu.log[this._paipu.log.length - 1].push(i);
    }
    delay(i, t) {
      if (this._sync) return i();
      t = this._dwell == 0 ? 0 : t == null ? Math.max(500, this._dwell) : t;
      setTimeout(i, t);
    }
    say(i, t) {
      if (this._view) this._view.say(i, t);
    }
    stop(i = () => {
    }) {
      this._stop = i;
    }
    start() {
      if (this._timeout_id) return;
      this._stop = null;
      this._timeout_id = setTimeout(() => this.next(), 0);
    }
    notify_players(i, t) {
      for (let e = 0; e < 4; e++) {
        let n = this._model.player_id[e];
        if (this._sync)
          this._players[n].action(t[e]);
        else setTimeout(() => {
          this._players[n].action(t[e]);
        }, 0);
      }
    }
    call_players(i, t, e) {
      e = this._dwell == 0 ? 0 : e == null ? this._dwell : e;
      this._status = i;
      this._reply = [];
      for (let n = 0; n < 4; n++) {
        let a = this._model.player_id[n];
        if (this._sync)
          this._players[a].action(
            t[n],
            (s) => this.reply(a, s)
          );
        else setTimeout(() => {
          this._players[a].action(
            t[n],
            (s) => this.reply(a, s)
          );
        }, 0);
      }
      if (!this._sync)
        this._timeout_id = setTimeout(() => this.next(), e);
    }
    reply(i, t) {
      this._reply[i] = t || {};
      if (this._sync) return;
      if (this._reply.filter((e) => e).length < 4) return;
      if (!this._timeout_id)
        this._timeout_id = setTimeout(() => this.next(), 0);
    }
    next() {
      this._timeout_id = clearTimeout(this._timeout_id);
      if (this._reply.filter((i) => i).length < 4) return;
      if (this._stop) return this._stop();
      if (this._status == "kaiju") this.reply_kaiju();
      else if (this._status == "qipai") this.reply_qipai();
      else if (this._status == "zimo") this.reply_zimo();
      else if (this._status == "dapai") this.reply_dapai();
      else if (this._status == "fulou") this.reply_fulou();
      else if (this._status == "gang") this.reply_gang();
      else if (this._status == "gangzimo") this.reply_zimo();
      else if (this._status == "hule") this.reply_hule();
      else if (this._status == "pingju") this.reply_pingju();
      else this._callback(this._paipu);
    }
    do_sync() {
      this._sync = true;
      this.kaiju();
      for (; ; ) {
        if (this._status == "kaiju") this.reply_kaiju();
        else if (this._status == "qipai") this.reply_qipai();
        else if (this._status == "zimo") this.reply_zimo();
        else if (this._status == "dapai") this.reply_dapai();
        else if (this._status == "fulou") this.reply_fulou();
        else if (this._status == "gang") this.reply_gang();
        else if (this._status == "gangzimo") this.reply_zimo();
        else if (this._status == "hule") this.reply_hule();
        else if (this._status == "pingju") this.reply_pingju();
        else break;
      }
      this._callback(this._paipu);
      return this;
    }
    kaiju(i) {
      this._model.qijia = i ?? Math.floor(Math.random() * 4);
      this._max_jushu = this._rule["\u5834\u6570"] == 0 ? 0 : this._rule["\u5834\u6570"] * 4 - 1;
      this._paipu = {
        title: this._model.title,
        player: this._model.player,
        qijia: this._model.qijia,
        log: [],
        defen: this._model.defen.concat(),
        point: [],
        rank: []
      };
      let t = [];
      for (let e = 0; e < 4; e++) {
        t[e] = JSON.parse(JSON.stringify({
          kaiju: {
            id: e,
            rule: this._rule,
            title: this._paipu.title,
            player: this._paipu.player,
            qijia: this._paipu.qijia
          }
        }));
      }
      this.call_players("kaiju", t, 0);
      if (this._view) this._view.kaiju();
    }
    qipai(i) {
      let t = this._model;
      t.shan = i || new m.Shan(this._rule);
      for (let a = 0; a < 4; a++) {
        let s = [];
        for (let h = 0; h < 13; h++) {
          s.push(t.shan.zimo());
        }
        t.shoupai[a] = new m.Shoupai(s);
        t.he[a] = new m.He();
        t.player_id[a] = (t.qijia + t.jushu + a) % 4;
      }
      t.lunban = -1;
      this._diyizimo = true;
      this._fengpai = this._rule["\u9014\u4E2D\u6D41\u5C40\u3042\u308A"];
      this._dapai = null;
      this._gang = null;
      this._lizhi = [0, 0, 0, 0];
      this._yifa = [0, 0, 0, 0];
      this._n_gang = [0, 0, 0, 0];
      this._neng_rong = [1, 1, 1, 1];
      this._hule = [];
      this._hule_option = null;
      this._no_game = false;
      this._lianzhuang = false;
      this._changbang = t.changbang;
      this._fenpei = null;
      this._paipu.defen = t.defen.concat();
      this._paipu.log.push([]);
      let e = {
        qipai: {
          zhuangfeng: t.zhuangfeng,
          jushu: t.jushu,
          changbang: t.changbang,
          lizhibang: t.lizhibang,
          defen: t.player_id.map((a) => t.defen[a]),
          baopai: t.shan.baopai[0],
          shoupai: t.shoupai.map((a) => a.toString())
        }
      };
      this.add_paipu(e);
      let n = [];
      for (let a = 0; a < 4; a++) {
        n[a] = JSON.parse(JSON.stringify(e));
        for (let s = 0; s < 4; s++) {
          if (s != a) n[a].qipai.shoupai[s] = "";
        }
      }
      this.call_players("qipai", n);
      if (this._view) this._view.redraw();
    }
    zimo() {
      let i = this._model;
      i.lunban = (i.lunban + 1) % 4;
      let t = i.shan.zimo();
      i.shoupai[i.lunban].zimo(t);
      let e = { zimo: { l: i.lunban, p: t } };
      this.add_paipu(e);
      let n = [];
      for (let a = 0; a < 4; a++) {
        n[a] = JSON.parse(JSON.stringify(e));
        if (a != i.lunban) n[a].zimo.p = "";
      }
      this.call_players("zimo", n);
      if (this._view) this._view.update(e);
    }
    dapai(i) {
      let t = this._model;
      this._yifa[t.lunban] = 0;
      if (!t.shoupai[t.lunban].lizhi)
        this._neng_rong[t.lunban] = true;
      t.shoupai[t.lunban].dapai(i);
      t.he[t.lunban].dapai(i);
      if (this._diyizimo) {
        if (!i.match(/^z[1234]/)) this._fengpai = false;
        if (this._dapai && this._dapai.slice(0, 2) != i.slice(0, 2))
          this._fengpai = false;
      } else this._fengpai = false;
      if (i.slice(-1) == "*") {
        this._lizhi[t.lunban] = this._diyizimo ? 2 : 1;
        this._yifa[t.lunban] = this._rule["\u4E00\u767A\u3042\u308A"];
      }
      if (m.Util.xiangting(t.shoupai[t.lunban]) == 0 && m.Util.tingpai(t.shoupai[t.lunban]).find((a) => t.he[t.lunban].find(a))) {
        this._neng_rong[t.lunban] = false;
      }
      this._dapai = i;
      let e = { dapai: { l: t.lunban, p: i } };
      this.add_paipu(e);
      if (this._gang) this.kaigang();
      let n = [];
      for (let a = 0; a < 4; a++) {
        n[a] = JSON.parse(JSON.stringify(e));
      }
      this.call_players("dapai", n);
      if (this._view) this._view.update(e);
    }
    fulou(i) {
      let t = this._model;
      this._diyizimo = false;
      this._yifa = [0, 0, 0, 0];
      t.he[t.lunban].fulou(i);
      let e = i.match(/[\+\=\-]/);
      t.lunban = (t.lunban + "_-=+".indexOf(e)) % 4;
      t.shoupai[t.lunban].fulou(i);
      if (i.match(/^[mpsz]\d{4}/)) {
        this._gang = i;
        this._n_gang[t.lunban]++;
      }
      let n = { fulou: { l: t.lunban, m: i } };
      this.add_paipu(n);
      let a = [];
      for (let s = 0; s < 4; s++) {
        a[s] = JSON.parse(JSON.stringify(n));
      }
      this.call_players("fulou", a);
      if (this._view) this._view.update(n);
    }
    gang(i) {
      let t = this._model;
      t.shoupai[t.lunban].gang(i);
      let e = { gang: { l: t.lunban, m: i } };
      this.add_paipu(e);
      if (this._gang) this.kaigang();
      this._gang = i;
      this._n_gang[t.lunban]++;
      let n = [];
      for (let a = 0; a < 4; a++) {
        n[a] = JSON.parse(JSON.stringify(e));
      }
      this.call_players("gang", n);
      if (this._view) this._view.update(e);
    }
    gangzimo() {
      let i = this._model;
      this._diyizimo = false;
      this._yifa = [0, 0, 0, 0];
      let t = i.shan.gangzimo();
      i.shoupai[i.lunban].zimo(t);
      let e = { gangzimo: { l: i.lunban, p: t } };
      this.add_paipu(e);
      if (!this._rule["\u30AB\u30F3\u30C9\u30E9\u5F8C\u4E57\u305B"] || this._gang.match(/^[mpsz]\d{4}$/)) this.kaigang();
      let n = [];
      for (let a = 0; a < 4; a++) {
        n[a] = JSON.parse(JSON.stringify(e));
        if (a != i.lunban) n[a].gangzimo.p = "";
      }
      this.call_players("gangzimo", n);
      if (this._view) this._view.update(e);
    }
    kaigang() {
      this._gang = null;
      if (!this._rule["\u30AB\u30F3\u30C9\u30E9\u3042\u308A"]) return;
      let i = this._model;
      i.shan.kaigang();
      let t = i.shan.baopai.pop();
      let e = { kaigang: { baopai: t } };
      this.add_paipu(e);
      let n = [];
      for (let a = 0; a < 4; a++) {
        n[a] = JSON.parse(JSON.stringify(e));
      }
      this.notify_players("kaigang", n);
      if (this._view) this._view.update(e);
    }
    hule() {
      let i = this._model;
      if (this._status != "hule") {
        i.shan.close();
        this._hule_option = this._status == "gang" ? "qianggang" : this._status == "gangzimo" ? "lingshang" : null;
      }
      let t = this._hule.length ? this._hule.shift() : i.lunban;
      let e = t == i.lunban ? null : (this._hule_option == "qianggang" ? this._gang[0] + this._gang.slice(-1) : this._dapai.slice(0, 2)) + "_+=-"[(4 + i.lunban - t) % 4];
      let n = i.shoupai[t].clone();
      let a = n.lizhi ? i.shan.fubaopai : null;
      let s = {
        rule: this._rule,
        zhuangfeng: i.zhuangfeng,
        menfeng: t,
        hupai: {
          lizhi: this._lizhi[t],
          yifa: this._yifa[t],
          qianggang: this._hule_option == "qianggang",
          lingshang: this._hule_option == "lingshang",
          haidi: i.shan.paishu > 0 || this._hule_option == "lingshang" ? 0 : !e ? 1 : 2,
          tianhu: !(this._diyizimo && !e) ? 0 : t == 0 ? 1 : 2
        },
        baopai: i.shan.baopai,
        fubaopai: a,
        jicun: {
          changbang: i.changbang,
          lizhibang: i.lizhibang
        }
      };
      let h = m.Util.hule(n, e, s);
      if (this._rule["\u9023\u8358\u65B9\u5F0F"] > 0 && t == 0) this._lianzhuang = true;
      if (this._rule["\u5834\u6570"] == 0) this._lianzhuang = false;
      this._fenpei = h.fenpei;
      let u = {
        hule: {
          l: t,
          shoupai: e ? n.zimo(e).toString() : n.toString(),
          baojia: e ? i.lunban : null,
          fubaopai: a,
          fu: h.fu,
          fanshu: h.fanshu,
          damanguan: h.damanguan,
          defen: h.defen,
          hupai: h.hupai,
          fenpei: h.fenpei
        }
      };
      for (let f of ["fu", "fanshu", "damanguan"]) {
        if (!u.hule[f]) delete u.hule[f];
      }
      this.add_paipu(u);
      let r = [];
      for (let f = 0; f < 4; f++) {
        r[f] = JSON.parse(JSON.stringify(u));
      }
      this.call_players("hule", r, this._wait);
      if (this._view) this._view.update(u);
    }
    pingju(i, t = ["", "", "", ""]) {
      let e = this._model;
      let n = [0, 0, 0, 0];
      if (!i) {
        let h = 0;
        for (let u = 0; u < 4; u++) {
          if (this._rule["\u30CE\u30FC\u30C6\u30F3\u5BA3\u8A00\u3042\u308A"] && !t[u] && !e.shoupai[u].lizhi) continue;
          if (!this._rule["\u30CE\u30FC\u30C6\u30F3\u7F70\u3042\u308A"] && (this._rule["\u9023\u8358\u65B9\u5F0F"] != 2 || u != 0) && !e.shoupai[u].lizhi) {
            t[u] = "";
          } else if (m.Util.xiangting(e.shoupai[u]) == 0 && m.Util.tingpai(e.shoupai[u]).length > 0) {
            h++;
            t[u] = e.shoupai[u].toString();
            if (this._rule["\u9023\u8358\u65B9\u5F0F"] == 2 && u == 0)
              this._lianzhuang = true;
          } else {
            t[u] = "";
          }
        }
        if (this._rule["\u6D41\u3057\u6E80\u8CAB\u3042\u308A"]) {
          for (let u = 0; u < 4; u++) {
            let r = true;
            for (let f of e.he[u]._pai) {
              if (f.match(/[\+\=\-]$/)) {
                r = false;
                break;
              }
              if (f.match(/^z/)) continue;
              if (f.match(/^[mps][19]/)) continue;
              r = false;
              break;
            }
            if (r) {
              i = "\u6D41\u3057\u6E80\u8CAB";
              for (let f = 0; f < 4; f++) {
                n[f] += u == 0 && f == u ? 12e3 : u == 0 ? -4e3 : u != 0 && f == u ? 8e3 : u != 0 && f == 0 ? -4e3 : -2e3;
              }
            }
          }
        }
        if (!i) {
          i = "\u8352\u724C\u5E73\u5C40";
          if (this._rule["\u30CE\u30FC\u30C6\u30F3\u7F70\u3042\u308A"] && 0 < h && h < 4) {
            for (let u = 0; u < 4; u++) {
              n[u] = t[u] ? 3e3 / h : -3e3 / (4 - h);
            }
          }
        }
        if (this._rule["\u9023\u8358\u65B9\u5F0F"] == 3) this._lianzhuang = true;
      } else {
        this._no_game = true;
        this._lianzhuang = true;
      }
      if (this._rule["\u5834\u6570"] == 0) this._lianzhuang = true;
      this._fenpei = n;
      let a = {
        pingju: { name: i, shoupai: t, fenpei: n }
      };
      this.add_paipu(a);
      let s = [];
      for (let h = 0; h < 4; h++) {
        s[h] = JSON.parse(JSON.stringify(a));
      }
      this.call_players("pingju", s, this._wait);
      if (this._view) this._view.update(a);
    }
    last() {
      let i = this._model;
      i.lunban = -1;
      if (this._view) this._view.update();
      if (!this._lianzhuang) {
        i.jushu++;
        i.zhuangfeng += i.jushu / 4 | 0;
        i.jushu = i.jushu % 4;
      }
      let t = false;
      let e = -1;
      const n = i.defen;
      for (let s = 0; s < 4; s++) {
        let h = (i.qijia + s) % 4;
        if (n[h] < 0 && this._rule["\u30C8\u30D3\u7D42\u4E86\u3042\u308A"]) t = true;
        if (n[h] >= 3e4 && (e < 0 || n[h] > n[e])) e = h;
      }
      let a = i.zhuangfeng * 4 + i.jushu;
      if (15 < a) t = true;
      else if ((this._rule["\u5834\u6570"] + 1) * 4 - 1 < a) t = true;
      else if (this._max_jushu < a) {
        if (this._rule["\u5EF6\u9577\u6226\u65B9\u5F0F"] == 0) t = true;
        else if (this._rule["\u5834\u6570"] == 0) t = true;
        else if (e >= 0) t = true;
        else {
          this._max_jushu += this._rule["\u5EF6\u9577\u6226\u65B9\u5F0F"] == 3 ? 4 : this._rule["\u5EF6\u9577\u6226\u65B9\u5F0F"] == 2 ? 1 : 0;
        }
      } else if (this._max_jushu == a) {
        if (this._rule["\u30AA\u30FC\u30E9\u30B9\u6B62\u3081\u3042\u308A"] && e == i.player_id[0] && this._lianzhuang && !this._no_game) t = true;
      }
      if (t) this.delay(() => this.jieju(), 0);
      else this.delay(() => this.qipai(), 0);
    }
    jieju() {
      let i = this._model;
      let t = [];
      const e = i.defen;
      for (let r = 0; r < 4; r++) {
        let f = (i.qijia + r) % 4;
        for (let c = 0; c < 4; c++) {
          if (c == t.length || e[f] > e[t[c]]) {
            t.splice(c, 0, f);
            break;
          }
        }
      }
      e[t[0]] += i.lizhibang * 1e3;
      this._paipu.defen = e;
      let n = [0, 0, 0, 0];
      for (let r = 0; r < 4; r++) {
        n[t[r]] = r + 1;
      }
      this._paipu.rank = n;
      const a = !this._rule["\u9806\u4F4D\u70B9"].find((r) => r.match(/\.\d$/));
      let s = [0, 0, 0, 0];
      for (let r = 1; r < 4; r++) {
        let f = t[r];
        s[f] = (e[f] - 3e4) / 1e3 + +this._rule["\u9806\u4F4D\u70B9"][r];
        if (a) s[f] = Math.round(s[f]);
        s[t[0]] -= s[f];
      }
      this._paipu.point = s.map((r) => r.toFixed(a ? 0 : 1));
      let h = { jieju: this._paipu };
      let u = [];
      for (let r = 0; r < 4; r++) {
        u[r] = JSON.parse(JSON.stringify(h));
      }
      this.call_players("jieju", u, this._wait);
      if (this._view) this._view.summary(this._paipu);
      if (this._handler) this._handler();
    }
    get_reply(i) {
      let t = this._model;
      return this._reply[t.player_id[i]];
    }
    reply_kaiju() {
      this.delay(() => this.qipai(), 0);
    }
    reply_qipai() {
      this.delay(() => this.zimo(), 0);
    }
    reply_zimo() {
      let i = this._model;
      let t = this.get_reply(i.lunban);
      if (t.daopai) {
        if (this.allow_pingju()) {
          let n = ["", "", "", ""];
          n[i.lunban] = i.shoupai[i.lunban].toString();
          return this.delay(() => this.pingju("\u4E5D\u7A2E\u4E5D\u724C", n), 0);
        }
      } else if (t.hule) {
        if (this.allow_hule()) {
          this.say("zimo", i.lunban);
          return this.delay(() => this.hule());
        }
      } else if (t.gang) {
        if (this.get_gang_mianzi().find((n) => n == t.gang)) {
          this.say("gang", i.lunban);
          return this.delay(() => this.gang(t.gang));
        }
      } else if (t.dapai) {
        let n = t.dapai.replace(/\*$/, "");
        if (this.get_dapai().find((a) => a == n)) {
          if (t.dapai.slice(-1) == "*" && this.allow_lizhi(n)) {
            this.say("lizhi", i.lunban);
            return this.delay(() => this.dapai(t.dapai));
          }
          return this.delay(() => this.dapai(n), 0);
        }
      }
      let e = this.get_dapai().pop();
      this.delay(() => this.dapai(e), 0);
    }
    reply_dapai() {
      let i = this._model;
      for (let n = 1; n < 4; n++) {
        let a = (i.lunban + n) % 4;
        let s = this.get_reply(a);
        if (s.hule && this.allow_hule(a)) {
          if (this._rule["\u6700\u5927\u540C\u6642\u548C\u4E86\u6570"] == 1 && this._hule.length)
            continue;
          this.say("rong", a);
          this._hule.push(a);
        } else {
          let h = i.shoupai[a].clone().zimo(this._dapai);
          if (m.Util.xiangting(h) == -1)
            this._neng_rong[a] = false;
        }
      }
      if (this._hule.length == 3 && this._rule["\u6700\u5927\u540C\u6642\u548C\u4E86\u6570"] == 2) {
        let n = ["", "", "", ""];
        for (let a of this._hule) {
          n[a] = i.shoupai[a].toString();
        }
        return this.delay(() => this.pingju("\u4E09\u5BB6\u548C", n));
      } else if (this._hule.length) {
        return this.delay(() => this.hule());
      }
      if (this._dapai.slice(-1) == "*") {
        i.defen[i.player_id[i.lunban]] -= 1e3;
        i.lizhibang++;
        if (this._lizhi.filter((n) => n).length == 4 && this._rule["\u9014\u4E2D\u6D41\u5C40\u3042\u308A"]) {
          let n = i.shoupai.map((a) => a.toString());
          return this.delay(() => this.pingju("\u56DB\u5BB6\u7ACB\u76F4", n));
        }
      }
      if (this._diyizimo && i.lunban == 3) {
        this._diyizimo = false;
        if (this._fengpai) {
          return this.delay(() => this.pingju("\u56DB\u98A8\u9023\u6253"), 0);
        }
      }
      if (this._n_gang.reduce((n, a) => n + a) == 4) {
        if (Math.max(...this._n_gang) < 4 && this._rule["\u9014\u4E2D\u6D41\u5C40\u3042\u308A"]) {
          return this.delay(() => this.pingju("\u56DB\u958B\u69D3"), 0);
        }
      }
      if (!i.shan.paishu) {
        let n = ["", "", "", ""];
        for (let a = 0; a < 4; a++) {
          let s = this.get_reply(a);
          if (s.daopai) n[a] = s.daopai;
        }
        return this.delay(() => this.pingju("", n), 0);
      }
      for (let n = 1; n < 4; n++) {
        let a = (i.lunban + n) % 4;
        let s = this.get_reply(a);
        if (s.fulou) {
          let h = s.fulou.replace(/0/g, "5");
          if (h.match(/^[mpsz](\d)\1\1\1/)) {
            if (this.get_gang_mianzi(a).find((u) => u == s.fulou)) {
              this.say("gang", a);
              return this.delay(() => this.fulou(s.fulou));
            }
          } else if (h.match(/^[mpsz](\d)\1\1/)) {
            if (this.get_peng_mianzi(a).find((u) => u == s.fulou)) {
              this.say("peng", a);
              return this.delay(() => this.fulou(s.fulou));
            }
          }
        }
      }
      let t = (i.lunban + 1) % 4;
      let e = this.get_reply(t);
      if (e.fulou) {
        if (this.get_chi_mianzi(t).find((n) => n == e.fulou)) {
          this.say("chi", t);
          return this.delay(() => this.fulou(e.fulou));
        }
      }
      this.delay(() => this.zimo(), 0);
    }
    reply_fulou() {
      let i = this._model;
      if (this._gang) {
        return this.delay(() => this.gangzimo(), 0);
      }
      let t = this.get_reply(i.lunban);
      if (t.dapai) {
        if (this.get_dapai().find((n) => n == t.dapai)) {
          return this.delay(() => this.dapai(t.dapai), 0);
        }
      }
      let e = this.get_dapai().pop();
      this.delay(() => this.dapai(e), 0);
    }
    reply_gang() {
      let i = this._model;
      if (this._gang.match(/^[mpsz]\d{4}$/)) {
        return this.delay(() => this.gangzimo(), 0);
      }
      for (let t = 1; t < 4; t++) {
        let e = (i.lunban + t) % 4;
        let n = this.get_reply(e);
        if (n.hule && this.allow_hule(e)) {
          if (this._rule["\u6700\u5927\u540C\u6642\u548C\u4E86\u6570"] == 1 && this._hule.length)
            continue;
          this.say("rong", e);
          this._hule.push(e);
        } else {
          let a = this._gang[0] + this._gang.slice(-1);
          let s = i.shoupai[e].clone().zimo(a);
          if (m.Util.xiangting(s) == -1)
            this._neng_rong[e] = false;
        }
      }
      if (this._hule.length) {
        return this.delay(() => this.hule());
      }
      this.delay(() => this.gangzimo(), 0);
    }
    reply_hule() {
      let i = this._model;
      for (let t = 0; t < 4; t++) {
        i.defen[i.player_id[t]] += this._fenpei[t];
      }
      i.changbang = 0;
      i.lizhibang = 0;
      if (this._hule.length) {
        return this.delay(() => this.hule());
      } else {
        if (this._lianzhuang) i.changbang = this._changbang + 1;
        return this.delay(() => this.last(), 0);
      }
    }
    reply_pingju() {
      let i = this._model;
      for (let t = 0; t < 4; t++) {
        i.defen[i.player_id[t]] += this._fenpei[t];
      }
      i.changbang++;
      this.delay(() => this.last(), 0);
    }
    get_dapai() {
      let i = this._model;
      return k.get_dapai(this._rule, i.shoupai[i.lunban]);
    }
    get_chi_mianzi(i) {
      let t = this._model;
      let e = "_+=-"[(4 + t.lunban - i) % 4];
      return k.get_chi_mianzi(
        this._rule,
        t.shoupai[i],
        this._dapai + e,
        t.shan.paishu
      );
    }
    get_peng_mianzi(i) {
      let t = this._model;
      let e = "_+=-"[(4 + t.lunban - i) % 4];
      return k.get_peng_mianzi(
        this._rule,
        t.shoupai[i],
        this._dapai + e,
        t.shan.paishu
      );
    }
    get_gang_mianzi(i) {
      let t = this._model;
      if (i == null) {
        return k.get_gang_mianzi(
          this._rule,
          t.shoupai[t.lunban],
          null,
          t.shan.paishu,
          this._n_gang.reduce((e, n) => e + n)
        );
      } else {
        let e = "_+=-"[(4 + t.lunban - i) % 4];
        return k.get_gang_mianzi(
          this._rule,
          t.shoupai[i],
          this._dapai + e,
          t.shan.paishu,
          this._n_gang.reduce((n, a) => n + a)
        );
      }
    }
    allow_lizhi(i) {
      let t = this._model;
      return k.allow_lizhi(
        this._rule,
        t.shoupai[t.lunban],
        i,
        t.shan.paishu,
        t.defen[t.player_id[t.lunban]]
      );
    }
    allow_hule(i) {
      let t = this._model;
      if (i == null) {
        let e = t.shoupai[t.lunban].lizhi || this._status == "gangzimo" || t.shan.paishu == 0;
        return k.allow_hule(
          this._rule,
          t.shoupai[t.lunban],
          null,
          t.zhuangfeng,
          t.lunban,
          e
        );
      } else {
        let e = (this._status == "gang" ? this._gang[0] + this._gang.slice(-1) : this._dapai) + "_+=-"[(4 + t.lunban - i) % 4];
        let n = t.shoupai[i].lizhi || this._status == "gang" || t.shan.paishu == 0;
        return k.allow_hule(
          this._rule,
          t.shoupai[i],
          e,
          t.zhuangfeng,
          i,
          n,
          this._neng_rong[i]
        );
      }
    }
    allow_pingju() {
      let i = this._model;
      return k.allow_pingju(
        this._rule,
        i.shoupai[i.lunban],
        this._diyizimo
      );
    }
    static get_dapai(i, t) {
      if (i["\u55B0\u3044\u66FF\u3048\u8A31\u53EF\u30EC\u30D9\u30EB"] == 0) return t.get_dapai(true);
      if (i["\u55B0\u3044\u66FF\u3048\u8A31\u53EF\u30EC\u30D9\u30EB"] == 1 && t._zimo && t._zimo.length > 2) {
        let e = t._zimo[0] + (+t._zimo.match(/\d(?=[\+\=\-])/) || 5);
        return t.get_dapai(false).filter((n) => n.replace(/0/, "5") != e);
      }
      return t.get_dapai(false);
    }
    static get_chi_mianzi(i, t, e, n) {
      let a = t.get_chi_mianzi(e, i["\u55B0\u3044\u66FF\u3048\u8A31\u53EF\u30EC\u30D9\u30EB"] == 0);
      if (!a) return a;
      if (i["\u55B0\u3044\u66FF\u3048\u8A31\u53EF\u30EC\u30D9\u30EB"] == 1 && t._fulou.length == 3 && t._bingpai[e[0]][e[1]] == 2) a = [];
      return n == 0 ? [] : a;
    }
    static get_peng_mianzi(i, t, e, n) {
      let a = t.get_peng_mianzi(e);
      if (!a) return a;
      return n == 0 ? [] : a;
    }
    static get_gang_mianzi(i, t, e, n, a) {
      let s = t.get_gang_mianzi(e);
      if (!s || s.length == 0) return s;
      if (t.lizhi) {
        if (i["\u30EA\u30FC\u30C1\u5F8C\u6697\u69D3\u8A31\u53EF\u30EC\u30D9\u30EB"] == 0) return [];
        else if (i["\u30EA\u30FC\u30C1\u5F8C\u6697\u69D3\u8A31\u53EF\u30EC\u30D9\u30EB"] == 1) {
          let h, u = 0, r = 0;
          h = t.clone().dapai(t._zimo);
          for (let f of m.Util.tingpai(h)) {
            u += m.Util.hule_mianzi(h, f).length;
          }
          h = t.clone().gang(s[0]);
          for (let f of m.Util.tingpai(h)) {
            r += m.Util.hule_mianzi(h, f).length;
          }
          if (u > r) return [];
        } else {
          let h;
          h = t.clone().dapai(t._zimo);
          let u = m.Util.tingpai(h).length;
          h = t.clone().gang(s[0]);
          if (m.Util.xiangting(h) > 0) return [];
          let r = m.Util.tingpai(h).length;
          if (u > r) return [];
        }
      }
      return n == 0 || a == 4 ? [] : s;
    }
    static allow_lizhi(i, t, e, n, a) {
      if (!t._zimo) return false;
      if (t.lizhi) return false;
      if (!t.menqian) return false;
      if (!i["\u30C4\u30E2\u756A\u306A\u3057\u30EA\u30FC\u30C1\u3042\u308A"] && n < 4) return false;
      if (i["\u30C8\u30D3\u7D42\u4E86\u3042\u308A"] && a < 1e3) return false;
      if (m.Util.xiangting(t) > 0) return false;
      if (e) {
        let s = t.clone().dapai(e);
        return m.Util.xiangting(s) == 0 && m.Util.tingpai(s).length > 0;
      } else {
        let s = [];
        for (let h of k.get_dapai(i, t)) {
          let u = t.clone().dapai(h);
          if (m.Util.xiangting(u) == 0 && m.Util.tingpai(u).length > 0) {
            s.push(h);
          }
        }
        return s.length ? s : false;
      }
    }
    static allow_hule(i, t, e, n, a, s, h) {
      if (e && !h) return false;
      let u = t.clone();
      if (e) u.zimo(e);
      if (m.Util.xiangting(u) != -1) return false;
      if (s) return true;
      let r = {
        rule: i,
        zhuangfeng: n,
        menfeng: a,
        hupai: {},
        baopai: [],
        jicun: { changbang: 0, lizhibang: 0 }
      };
      let f = m.Util.hule(t, e, r);
      return f.hupai != null;
    }
    static allow_pingju(i, t, e) {
      if (!(e && t._zimo)) return false;
      if (!i["\u9014\u4E2D\u6D41\u5C40\u3042\u308A"]) return false;
      let n = 0;
      for (let a of ["m", "p", "s", "z"]) {
        let s = t._bingpai[a];
        let h = a == "z" ? [1, 2, 3, 4, 5, 6, 7] : [1, 9];
        for (let u of h) {
          if (s[u] > 0) n++;
        }
      }
      return n >= 9;
    }
    static allow_no_daopai(i, t, e) {
      if (e > 0 || t._zimo) return false;
      if (!i["\u30CE\u30FC\u30C6\u30F3\u5BA3\u8A00\u3042\u308A"]) return false;
      if (t.lizhi) return false;
      return m.Util.xiangting(t) == 0 && m.Util.tingpai(t).length > 0;
    }
  };
});

// lib/vendor/majiang/package/lib/player.js
var si = x((Yi, ai) => {
  "use strict";
  var v = {
    Shoupai: E(),
    He: O(),
    Game: P(),
    Board: B(),
    Util: Object.assign(
      G(),
      R()
    )
  };
  ai.exports = class Xi {
    constructor() {
      this._model = new v.Board();
    }
    action(i, t) {
      this._callback = t;
      if (i.kaiju) this.kaiju(i.kaiju);
      else if (i.qipai) this.qipai(i.qipai);
      else if (i.zimo) this.zimo(i.zimo);
      else if (i.dapai) this.dapai(i.dapai);
      else if (i.fulou) this.fulou(i.fulou);
      else if (i.gang) this.gang(i.gang);
      else if (i.gangzimo) this.zimo(i.gangzimo, true);
      else if (i.kaigang) this.kaigang(i.kaigang);
      else if (i.hule) this.hule(i.hule);
      else if (i.pingju) this.pingju(i.pingju);
      else if (i.jieju) this.jieju(i.jieju);
    }
    get shoupai() {
      return this._model.shoupai[this._menfeng];
    }
    get he() {
      return this._model.he[this._menfeng];
    }
    get shan() {
      return this._model.shan;
    }
    get hulepai() {
      return v.Util.xiangting(this.shoupai) == 0 && v.Util.tingpai(this.shoupai) || [];
    }
    get model() {
      return this._model;
    }
    set view(i) {
      this._view = i;
    }
    get view() {
      return this._view;
    }
    kaiju(i) {
      this._id = i.id;
      this._rule = i.rule;
      this._model.kaiju(i);
      if (this._view) this._view.kaiju(i.id);
      if (this._callback) this.action_kaiju(i);
    }
    qipai(i) {
      this._model.qipai(i);
      this._menfeng = this._model.menfeng(this._id);
      this._diyizimo = true;
      this._n_gang = 0;
      this._neng_rong = true;
      if (this._view) this._view.redraw();
      if (this._callback) this.action_qipai(i);
    }
    zimo(i, t) {
      this._model.zimo(i);
      if (t) this._n_gang++;
      if (this._view) {
        if (t) this._view.update({ gangzimo: i });
        else this._view.update({ zimo: i });
      }
      if (this._callback) this.action_zimo(i, t);
    }
    dapai(i) {
      if (i.l == this._menfeng) {
        if (!this.shoupai.lizhi) this._neng_rong = true;
      }
      this._model.dapai(i);
      if (this._view) this._view.update({ dapai: i });
      if (this._callback) this.action_dapai(i);
      if (i.l == this._menfeng) {
        this._diyizimo = false;
        if (this.hulepai.find((t) => this.he.find(t))) this._neng_rong = false;
      } else {
        let t = i.p[0], e = +i.p[1] || 5;
        if (this.hulepai.find((n) => n == t + e)) this._neng_rong = false;
      }
    }
    fulou(i) {
      this._model.fulou(i);
      if (this._view) this._view.update({ fulou: i });
      if (this._callback) this.action_fulou(i);
      this._diyizimo = false;
    }
    gang(i) {
      this._model.gang(i);
      if (this._view) this._view.update({ gang: i });
      if (this._callback) this.action_gang(i);
      this._diyizimo = false;
      if (i.l != this._menfeng && !i.m.match(/^[mpsz]\d{4}$/)) {
        let t = i.m[0], e = +i.m.slice(-1) || 5;
        if (this.hulepai.find((n) => n == t + e)) this._neng_rong = false;
      }
    }
    kaigang(i) {
      this._model.kaigang(i);
      if (this._view) this._view.update({ kaigang: i });
    }
    hule(i) {
      this._model.hule(i);
      if (this._view) this._view.update({ hule: i });
      if (this._callback) this.action_hule(i);
    }
    pingju(i) {
      this._model.pingju(i);
      if (this._view) this._view.update({ pingju: i });
      if (this._callback) this.action_pingju(i);
    }
    jieju(i) {
      this._model.jieju(i);
      this._paipu = i;
      if (this._view) this._view.summary(i);
      if (this._callback) this.action_jieju(i);
    }
    get_dapai(i) {
      return v.Game.get_dapai(this._rule, i);
    }
    get_chi_mianzi(i, t) {
      return v.Game.get_chi_mianzi(
        this._rule,
        i,
        t,
        this.shan.paishu
      );
    }
    get_peng_mianzi(i, t) {
      return v.Game.get_peng_mianzi(
        this._rule,
        i,
        t,
        this.shan.paishu
      );
    }
    get_gang_mianzi(i, t) {
      return v.Game.get_gang_mianzi(
        this._rule,
        i,
        t,
        this.shan.paishu,
        this._n_gang
      );
    }
    allow_lizhi(i, t) {
      return v.Game.allow_lizhi(
        this._rule,
        i,
        t,
        this.shan.paishu,
        this._model.defen[this._id]
      );
    }
    allow_hule(i, t, e) {
      e = e || i.lizhi || this.shan.paishu == 0;
      return v.Game.allow_hule(
        this._rule,
        i,
        t,
        this._model.zhuangfeng,
        this._menfeng,
        e,
        this._neng_rong
      );
    }
    allow_pingju(i) {
      return v.Game.allow_pingju(
        this._rule,
        i,
        this._diyizimo
      );
    }
    allow_no_daopai(i) {
      return v.Game.allow_no_daopai(
        this._rule,
        i,
        this.shan.paishu
      );
    }
  };
});

// lib/vendor/majiang/package/lib/index.js
var Ti = x((Zi, li) => {
  /*!
   *  @kobalab/majiang-core v1.4.1
   *
   *  Copyright(C) 2021 Satoshi Kobayashi
   *  Released under the MIT license
   *  https://github.com/kobalab/majiang-core/blob/master/LICENSE
   */
  li.exports = {
    rule: N(),
    Shoupai: E(),
    Shan: M(),
    He: O(),
    Board: B(),
    Game: P(),
    Player: si(),
    Util: Object.assign(
      G(),
      R()
    )
  };
});
export default Ti();
