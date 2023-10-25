/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@lit/reactive-element@2.0.0/reactive-element.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = globalThis,
  e =
    t.ShadowRoot &&
    (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) &&
    "adoptedStyleSheets" in Document.prototype &&
    "replace" in CSSStyleSheet.prototype,
  s = Symbol(),
  i = new WeakMap();
class r {
  constructor(t, e, i) {
    if (((this._$cssResult$ = !0), i !== s))
      throw Error(
        "CSSResult is not constructable. Use `unsafeCSS` or `css` instead."
      );
    (this.cssText = t), (this.t = e);
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (e && void 0 === t) {
      const e = void 0 !== s && 1 === s.length;
      e && (t = i.get(s)),
        void 0 === t &&
          ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText),
          e && i.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
}
const o = (t) => new r("string" == typeof t ? t : t + "", void 0, s),
  n = (t, ...e) => {
    const i =
      1 === t.length
        ? t[0]
        : e.reduce(
            (e, s, i) =>
              e +
              ((t) => {
                if (!0 === t._$cssResult$) return t.cssText;
                if ("number" == typeof t) return t;
                throw Error(
                  "Value passed to 'css' function must be a 'css' function result: " +
                    t +
                    ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security."
                );
              })(s) +
              t[i + 1],
            t[0]
          );
    return new r(i, t, s);
  },
  a = (s, i) => {
    if (e)
      s.adoptedStyleSheets = i.map((t) =>
        t instanceof CSSStyleSheet ? t : t.styleSheet
      );
    else
      for (const e of i) {
        const i = document.createElement("style"),
          r = t.litNonce;
        void 0 !== r && i.setAttribute("nonce", r),
          (i.textContent = e.cssText),
          s.appendChild(i);
      }
  },
  h = e
    ? (t) => t
    : (t) =>
        t instanceof CSSStyleSheet
          ? ((t) => {
              let e = "";
              for (const s of t.cssRules) e += s.cssText;
              return o(e);
            })(t)
          : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const {
    is: c,
    defineProperty: l,
    getOwnPropertyDescriptor: p,
    getOwnPropertyNames: d,
    getOwnPropertySymbols: u,
    getPrototypeOf: f,
  } = Object,
  y = globalThis,
  S = y.trustedTypes,
  E = S ? S.emptyScript : "",
  $ = y.reactiveElementPolyfillSupport,
  _ = (t, e) => t,
  m = {
    toAttribute(t, e) {
      switch (e) {
        case Boolean:
          t = t ? E : null;
          break;
        case Object:
        case Array:
          t = null == t ? t : JSON.stringify(t);
      }
      return t;
    },
    fromAttribute(t, e) {
      let s = t;
      switch (e) {
        case Boolean:
          s = null !== t;
          break;
        case Number:
          s = null === t ? null : Number(t);
          break;
        case Object:
        case Array:
          try {
            s = JSON.parse(t);
          } catch (t) {
            s = null;
          }
      }
      return s;
    },
  },
  g = (t, e) => !c(t, e),
  b = { attribute: !0, type: String, converter: m, reflect: !1, hasChanged: g };
(Symbol.metadata ??= Symbol("metadata")),
  (y.litPropertyMetadata ??= new WeakMap());
class v extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = b) {
    if (
      (e.state && (e.attribute = !1),
      this._$Ei(),
      this.elementProperties.set(t, e),
      !e.noAccessor)
    ) {
      const s = Symbol(),
        i = this.getPropertyDescriptor(t, s, e);
      void 0 !== i && l(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: r } = p(this.prototype, t) ?? {
      get() {
        return this[e];
      },
      set(t) {
        this[e] = t;
      },
    };
    return {
      get() {
        return i?.call(this);
      },
      set(e) {
        const o = i?.call(this);
        r.call(this, e), this.requestUpdate(t, o, s);
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(_("elementProperties"))) return;
    const t = f(this);
    t.finalize(),
      void 0 !== t.l && (this.l = [...t.l]),
      (this.elementProperties = new Map(t.elementProperties));
  }
  static finalize() {
    if (this.hasOwnProperty(_("finalized"))) return;
    if (
      ((this.finalized = !0), this._$Ei(), this.hasOwnProperty(_("properties")))
    ) {
      const t = this.properties,
        e = [...d(t), ...u(t)];
      for (const s of e) this.createProperty(s, t[s]);
    }
    const t = this[Symbol.metadata];
    if (null !== t) {
      const e = litPropertyMetadata.get(t);
      if (void 0 !== e)
        for (const [t, s] of e) this.elementProperties.set(t, s);
    }
    this._$Eh = new Map();
    for (const [t, e] of this.elementProperties) {
      const s = this._$Eu(t, e);
      void 0 !== s && this._$Eh.set(s, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const t of s) e.unshift(h(t));
    } else void 0 !== t && e.push(h(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return !1 === s
      ? void 0
      : "string" == typeof s
      ? s
      : "string" == typeof t
      ? t.toLowerCase()
      : void 0;
  }
  constructor() {
    super(),
      (this._$Ep = void 0),
      (this.isUpdatePending = !1),
      (this.hasUpdated = !1),
      (this._$Em = null),
      this._$Ev();
  }
  _$Ev() {
    (this._$Eg = new Promise((t) => (this.enableUpdating = t))),
      (this._$AL = new Map()),
      this._$E_(),
      this.requestUpdate(),
      this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$ES ??= []).push(t),
      void 0 !== this.renderRoot && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$ES?.splice(this._$ES.indexOf(t) >>> 0, 1);
  }
  _$E_() {
    const t = new Map(),
      e = this.constructor.elementProperties;
    for (const s of e.keys())
      this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t =
      this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return a(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    (this.renderRoot ??= this.createRenderRoot()),
      this.enableUpdating(!0),
      this._$ES?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {}
  disconnectedCallback() {
    this._$ES?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$EO(t, e) {
    const s = this.constructor.elementProperties.get(t),
      i = this.constructor._$Eu(t, s);
    if (void 0 !== i && !0 === s.reflect) {
      const r = (
        void 0 !== s.converter?.toAttribute ? s.converter : m
      ).toAttribute(e, s.type);
      (this._$Em = t),
        null == r ? this.removeAttribute(i) : this.setAttribute(i, r),
        (this._$Em = null);
    }
  }
  _$AK(t, e) {
    const s = this.constructor,
      i = s._$Eh.get(t);
    if (void 0 !== i && this._$Em !== i) {
      const t = s.getPropertyOptions(i),
        r =
          "function" == typeof t.converter
            ? { fromAttribute: t.converter }
            : void 0 !== t.converter?.fromAttribute
            ? t.converter
            : m;
      (this._$Em = i),
        (this[i] = r.fromAttribute(e, t.type)),
        (this._$Em = null);
    }
  }
  requestUpdate(t, e, s, i = !1, r) {
    if (void 0 !== t) {
      if (
        ((s ??= this.constructor.getPropertyOptions(t)),
        !(s.hasChanged ?? g)(i ? r : this[t], e))
      )
        return;
      this.C(t, e, s);
    }
    !1 === this.isUpdatePending && (this._$Eg = this._$EP());
  }
  C(t, e, s) {
    this._$AL.has(t) || this._$AL.set(t, e),
      !0 === s.reflect && this._$Em !== t && (this._$Ej ??= new Set()).add(t);
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$Eg;
    } catch (t) {
      Promise.reject(t);
    }
    const t = this.scheduleUpdate();
    return null != t && (await t), !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this._$Ep) {
        for (const [t, e] of this._$Ep) this[t] = e;
        this._$Ep = void 0;
      }
      const t = this.constructor.elementProperties;
      if (t.size > 0)
        for (const [e, s] of t)
          !0 !== s.wrapped ||
            this._$AL.has(e) ||
            void 0 === this[e] ||
            this.C(e, this[e], s);
    }
    let t = !1;
    const e = this._$AL;
    try {
      (t = this.shouldUpdate(e)),
        t
          ? (this.willUpdate(e),
            this._$ES?.forEach((t) => t.hostUpdate?.()),
            this.update(e))
          : this._$ET();
    } catch (e) {
      throw ((t = !1), this._$ET(), e);
    }
    t && this._$AE(e);
  }
  willUpdate(t) {}
  _$AE(t) {
    this._$ES?.forEach((t) => t.hostUpdated?.()),
      this.hasUpdated || ((this.hasUpdated = !0), this.firstUpdated(t)),
      this.updated(t);
  }
  _$ET() {
    (this._$AL = new Map()), (this.isUpdatePending = !1);
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$Eg;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    (this._$Ej &&= this._$Ej.forEach((t) => this._$EO(t, this[t]))),
      this._$ET();
  }
  updated(t) {}
  firstUpdated(t) {}
}
(v.elementStyles = []),
  (v.shadowRootOptions = { mode: "open" }),
  (v[_("elementProperties")] = new Map()),
  (v[_("finalized")] = new Map()),
  $?.({ ReactiveElement: v }),
  (y.reactiveElementVersions ??= []).push("2.0.0");
export {
  r as CSSResult,
  v as ReactiveElement,
  a as adoptStyles,
  n as css,
  m as defaultConverter,
  h as getCompatibleStyle,
  g as notEqual,
  e as supportsAdoptingStyleSheets,
  o as unsafeCSS,
};
export default null;
//# sourceMappingURL=/sm/ba83fefcd0eaf7e60b3fd34c8c37a3f7ea615798ec7a2c279dd521eb7c5e6923.map
