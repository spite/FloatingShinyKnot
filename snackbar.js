import { LitElement, html } from "https://unpkg.com/lit?module";

class SnackBar extends LitElement {
  static properties = {
    message: { type: String },
    visible: { type: Boolean },
  };

  constructor() {
    super();
    this.timeout = null;
    this.visible = false;
  }

  error(message) {
    this.message = message;
    this.visible = true;
    this.clearTimeout();
    this.timeout = setTimeout(() => {
      this.hide();
    }, 4000);
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  hide() {
    this.clearTimeout();
    this.visible = false;
  }

  render() {
    return html`
      <style>
        :host {
          position: fixed;
          bottom: 1em;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #bar {
          background-color: #808080;
          border-radius: 3px;
          padding: 1em;
          color: white;
          text-shadow: -1px 0 black;
          transform: translate(0, 5em);
          transition: transform 250ms ease-out;
        }
        #bar.visible {
          transform: translate(0, 0);
        }
      </style>
      <div id="bar" class="${this.visible ? "visible" : ""}">
        ${this.message} <button @click=${this.hide}>X</button>
      </div>
    `;
  }
}
customElements.define("snack-bar", SnackBar);
