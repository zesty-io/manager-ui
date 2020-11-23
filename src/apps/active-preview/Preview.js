import React, { Component } from "react";

import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";

import styles from "./Preview.less";
import "./device.min.css";
export class Preview extends Component {
  state = {
    domain: "",
    route: "", //this.props.location.search.slice(7),
    refresh: Date.now(), // Used to force a hard refresh when a item is updated
    device: "",
    x: "",
    y: "",
    copied: "Copy"
  };

  componentDidMount() {
    window.addEventListener("message", this.receiveMessage, false);
    window.addEventListener("keydown", this.handleKey, false);
    // this handles setting the domain in the case that
    // we lose the domain data in a refresh
    if (
      !this.state.domain &&
      localStorage.getItem("zesty-io:activePreviewDomain")
    ) {
      this.setState({
        domain: localStorage.getItem("zesty-io:activePreviewDomain")
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.device !== prevState.device) {
      const y =
        document.querySelector(".screen") &&
        document.querySelector(".screen").clientHeight;
      const x =
        document.querySelector(".screen") &&
        document.querySelector(".screen").clientWidth;
      this.setState({ x, y });
    }
  }

  receiveMessage = evt => {
    // Prevent malicious communication to this window
    if (evt.origin !== window.location.origin) {
      return;
    }

    switch (evt.data.type) {
      case "FORCE_RERENDER":
        this.setState({
          refresh: Date.now()
        });
        break;
      case "UPDATED_CONTENT_ITEM":
        if (evt.data.itemZUID === this.state.itemZUID) {
          this.setState({
            refresh: Date.now()
          });
        }
        break;
      case "RENDER_CONTENT_ITEM":
        let state = {};

        // Ensure a route was provided
        if (evt.data.route) {
          state.route = evt.data.route;
          window.history.pushState(
            null,
            "Live Preview",
            `?route=${evt.data.route}`
          );
        }

        if (evt.data.domain) {
          state.domain = evt.data.domain;
        }

        if (evt.data.itemZUID) {
          state.itemZUID = evt.data.itemZUID;
        }

        // Only update if new state exists
        if (Object.keys(state).length) {
          this.setState(state);
        }
        localStorage.setItem("zesty-io:activePreviewDomain", evt.data.domain);
        break;
    }
  };

  handleKey = evt => {
    // if the user tries to use cmd + r
    // to refresh the page, this refreshes
    // the iframe contents
    if (
      (((evt.metaKey || evt.ctrlKey) && evt.key === "r") ||
        evt.code === "f5") &&
      evt.type === "keydown"
    ) {
      evt.preventDefault();
      this.handleRefresh();
      return null;
    }
  };

  onSelect = device => {
    this.setState({ device });
  };

  createTemplateString = () => {
    const iFrame = `<div style="height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;">
      <iframe
      key={${this.state.refresh}}
      style="
          position: absolute;
          top: 0;
          bottom: 0;
          height: 100%;
          width: ${this.state.device.includes("Portrait") ? "103%" : "105%"};
          overflow-y: scroll;
          background-image: url('${`https://storage.googleapis.com/assets-zesty/loading.png`}');
          background-position: center center;
          background-repeat: no-repeat;
          background-size: 50%;
          "
      src="${this.state.domain}${this.state.route}"
      scrolling="yes"
      frameBorder="0"
        />
      </div>`;
    switch (this.state.device) {
      case "iPhone5":
        return `<div class="marvel-device iphone5s silver">
                  <div class="top-bar"></div>
                  <div class="sleep"></div>
                  <div class="volume"></div>
                  <div class="camera"></div>
                  <div class="sensor"></div>
                  <div class="speaker"></div>
                  <div class="screen">
                      ${iFrame}
                  </div>
                  <div class="home"></div>
                  <div class="bottom-bar"></div>
              </div>`;
      case "iPhone8":
        return `<div class="marvel-device iphone8 black">
              <div class="top-bar"></div>
              <div class="sleep"></div>
              <div class="volume"></div>
              <div class="camera"></div>
              <div class="sensor"></div>
              <div class="speaker"></div>
              <div class="screen">
                ${iFrame}
              </div>
              <div class="home"></div>
              <div class="bottom-bar"></div>
          </div>`;
      case "Note8":
        return `<div class="marvel-device note8">
                  <div class="inner"></div>
                  <div class="overflow">
                      <div class="shadow"></div>
                  </div>
                  <div class="speaker"></div>
                  <div class="sensors"></div>
                  <div class="more-sensors"></div>
                  <div class="sleep"></div>
                  <div class="volume"></div>
                  <div class="camera"></div>
                  <div class="screen">
                  ${iFrame}
                  </div>
                </div>`;
      case "iPhoneX":
        return `<div class="marvel-device iphone-x">
                  <div class="notch">
                      <div class="camera"></div>
                      <div class="speaker"></div>
                  </div>
                  <div class="top-bar"></div>
                  <div class="sleep"></div>
                  <div class="bottom-bar"></div>
                  <div class="volume"></div>
                  <div class="overflow">
                      <div class="shadow shadow--tr"></div>
                      <div class="shadow shadow--tl"></div>
                      <div class="shadow shadow--br"></div>
                      <div class="shadow shadow--bl"></div>
                  </div>
                  <div class="inner-shadow"></div>
                  <div class="screen">
                  ${iFrame}
                  </div>
              </div>`;
      case "iPadMini":
        return `<div class="marvel-device ipad silver">
                <div class="camera"></div>
                <div class="screen">
                ${iFrame}
                </div>
                <div class="home"></div>
                </div>`;
      case "iPadMiniPortrait":
        return `<div class="marvel-device ipad silver landscape">
                  <div class="camera"></div>
                  <div class="screen">
                  ${iFrame}
                  </div>
                  <div class="home"></div>
                  </div>`;
      case "Nexus5":
        return `<div class="marvel-device nexus5">
                  <div class="top-bar"></div>
                  <div class="sleep"></div>
                  <div class="volume"></div>
                  <div class="camera"></div>
                  <div class="screen">
                      ${iFrame}
                  </div>
              </div>`;
      case "HTCOne":
        return `<div class="marvel-device htc-one">
        <div class="top-bar"></div>
        <div class="camera"></div>
        <div class="sensor"></div>
        <div class="speaker"></div>
        <div class="screen">
            ${iFrame}
        </div>
    </div>`;
      case "Lumina920":
        return `<div class="marvel-device lumia920 black">
      <div class="top-bar"></div>
      <div class="volume"></div>
      <div class="camera"></div>
      <div class="speaker"></div>
      <div class="screen">
          ${iFrame}
      </div>
  </div>`;
    }
  };

  handleCopyText = () => {
    // this is gross, but we dont have another way to notify
    // the user of copy status
    this.setState({ copied: "Copied!" }, () => {
      setTimeout(() => {
        this.setState({ copied: "Copy" });
      }, 2000);
    });
  };

  handleCopy = () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.value = `${this.state.domain}${this.state.route}`;
    input.focus();
    input.select();
    const result = document.execCommand("copy");
    input.remove();
    if (result !== "unsuccessful") {
      this.handleCopyText();
    }
  };

  handleRefresh = () => {
    this.setState({
      refresh: Date.now()
    });
  };

  pathWithCopy = () => {
    return (
      <span className={styles.Location}>
        Previewing: &nbsp;
        <span
          className={styles.FakeInput}
        >{`${this.state.domain}${this.state.route}`}</span>
        <Url onClick={this.handleCopy}>
          <i className="fa fa-copy" /> {this.state.copied}
        </Url>
        <Url onClick={this.handleRefresh}>
          <i className="fas fa-sync" /> Reload
        </Url>
        <Url href={`${this.state.domain}${this.state.route}`} target="_blank">
          <i className="fas fa-external-link-square-alt" /> Open
        </Url>
      </span>
    );
  };

  render() {
    const selectedTemplate = this.createTemplateString();
    console.log(this.state.domain, this.state.route);
    return (
      <>
        {this.state.device === "" ? (
          <div className={styles.ActivePreview}>
            {this.state.domain ? (
              <div className={styles.FullPage}>
                <div className={styles.TopBar}>
                  <p>Full Screen</p>
                  {this.pathWithCopy()}
                </div>
                <iframe
                  key={this.state.refresh}
                  className={styles.Frame}
                  src={`${this.state.domain}${this.state.route}`}
                  scrolling="yes"
                  frameBorder="0"
                />
              </div>
            ) : (
              <div className={styles.NoDomain}>
                <h1>Live preview has lost its connection.</h1>
                <p>
                  To retain the connection, please close live preview and reopen
                  it.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.ActivePreview}>
            <div className={styles.TopBar}>
              <p>
                Device: {this.state.device}
                &nbsp;-&nbsp;
                {this.state.x}
                <span style={{ opacity: "0.8", padding: "1px" }}>𝑥</span>
                {this.state.y}
                px
              </p>
              {this.pathWithCopy()}
            </div>
            <div dangerouslySetInnerHTML={{ __html: selectedTemplate }} />
          </div>
        )}
        <div className={styles.Controls}>
          <Button
            onClick={() => this.onSelect("")}
            kind={this.state.device === "" ? "secondary" : "tertiary"}
          >
            Fullscreen
          </Button>
          <Button
            onClick={() => this.onSelect("iPhone5")}
            kind={this.state.device === "iPhone5" ? "secondary" : "tertiary"}
          >
            iPhone 5
          </Button>
          <Button
            onClick={() => this.onSelect("iPhone8")}
            kind={this.state.device === "iPhone8" ? "secondary" : "tertiary"}
          >
            iPhone 8
          </Button>
          <Button
            onClick={() => this.onSelect("iPhoneX")}
            kind={this.state.device === "iPhoneX" ? "secondary" : "tertiary"}
          >
            iPhone X
          </Button>
          <Button
            onClick={() => this.onSelect("iPadMini")}
            kind={this.state.device === "iPadMini" ? "secondary" : "tertiary"}
          >
            iPad mini
          </Button>
          <Button
            onClick={() => this.onSelect("iPadMiniPortrait")}
            kind={
              this.state.device === "iPadMiniPortrait"
                ? "secondary"
                : "tertiary"
            }
          >
            iPad mini <small>(Portrait)</small>
          </Button>
          <Button
            onClick={() => this.onSelect("Nexus5")}
            kind={this.state.device === "Nexus5" ? "secondary" : "tertiary"}
          >
            Nexus 5
          </Button>
          <Button
            onClick={() => this.onSelect("HTCOne")}
            kind={this.state.device === "HTCOne" ? "secondary" : "tertiary"}
          >
            HTC One
          </Button>
          <Button
            onClick={() => this.onSelect("Lumina920")}
            kind={this.state.device === "Lumina920" ? "secondary" : "tertiary"}
          >
            Lumina 920
          </Button>
          <Button
            onClick={() => this.onSelect("Note8")}
            kind={this.state.device === "Note8" ? "secondary" : "tertiary"}
          >
            Note 8
          </Button>
          <span className={styles.Logo}>
            <img
              height="20px"
              width="20px"
              src="https://brand.zesty.io/zesty-io-logo-dark.svg"
            />
            &nbsp; Active Preview
          </span>
        </div>
      </>
    );
  }
}
