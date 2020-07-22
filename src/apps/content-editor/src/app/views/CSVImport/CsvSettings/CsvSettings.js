import React, { Component } from "react";
import { Select, Option, Input } from "@zesty-io/core";

export const CsvSettings = props => {
  return (
    <section className={props.styles}>
      <article>
        <label>Meta Description</label>
        <Select name={"metaDescription"} onSelect={props.handleMap}>
          <Option text="none" value="none" />
          {props.cols.map(col => (
            <Option text={col} value={col} />
          ))}
        </Select>
      </article>
      <article>
        <label>Meta Keywords</label>
        <Select name="metaKeywords" onSelect={props.handleMap}>
          <Option text="none" value="none" />
          {props.cols.map(col => (
            <Option text={col} value={col} />
          ))}
        </Select>
      </article>
      <article>
        <label>Meta Link Text</label>
        <Select name="metaLinkText" onSelect={props.handleMap}>
          <Option text="none" value="none" />
          {props.cols.map(col => (
            <Option text={col} value={col} />
          ))}
        </Select>
      </article>
      <article>
        <label>Meta Title</label>
        <Select name="metaTitle" onSelect={props.handleMap}>
          <Option text="none" value="none" />
          {props.cols.map(col => (
            <Option text={col} value={col} />
          ))}
        </Select>
      </article>
      <article>
        <label>Parent ZUID</label>
        <Select name="parentZUID" onSelect={props.handleMap}>
          <Option text="none" value="none" />
          {props.cols.map(col => (
            <Option text={col} value={col} />
          ))}
        </Select>
      </article>
      <article>
        <label>Path Part</label>
        <Select name="pathPart" onSelect={props.handleMap}>
          <Option text="none" value="none" />
          {props.cols.map(col => (
            <Option text={col} value={col} />
          ))}
        </Select>
      </article>
      <CanonicalTag name="canonicalTagMode" onChange={props.handleMap} />
      <article>
        <label>Sitemap Priority</label>
        <Select name="sitemapPriority" value="-1.0" onSelect={props.handleMap}>
          <Option value={-1.0} text="Automatically Set Priority" />
          <Option value={1.0} text="1.0" />
          <Option value={0.9} text="0.9" />
          <Option value={0.8} text="0.8" />
          <Option value={0.7} text="0.7" />
          <Option value={0.6} text="0.6" />
          <Option value={0.5} text="0.5" />
          <Option value={0.4} text="0.4" />
          <Option value={0.3} text="0.3" />
          <Option value={0.2} text="0.2" />
          <Option value={0.1} text="0.1" />
          <Option value={-2.0} text="Do Not Display in Sitemap" />
        </Select>
      </article>
    </section>
  );
};

class CanonicalTag extends Component {
  state = {
    canonicalTagMode: 1,
    canonicalOptions: [
      {
        value: 0,
        text: "Off"
      },
      {
        value: 1,
        text: "On (Ignores query parameters)"
      },
      {
        value: 2,
        text: "On - Allow certain parameters"
      },
      {
        value: 3,
        text: "On - Custom Path or Custom URL"
      }
    ],
    whitelist: "",
    custom: ""
  };

  handleWhitelist = evt => {
    this.props.onChange(evt.target.value, evt.target.name);
    this.setState({
      whitelist: evt.target.value
    });
  };

  handleCustom = evt => {
    //   basil.change_detected = true
    this.props.onChange(evt.target.value, evt.target.name);
    this.setState({
      custom: evt.target.value
    });
  };

  render() {
    return (
      <article className={{ display: "flex" }}>
        <label>Canonical Tag</label>
        {zesty.instance.settings.seo["canonical-tags-enabled"] === "1" ? (
          <small className={`desc notEnabled`}>
            Canonical tags are not enabled. For more information, read
            <a
              href="https://developer.zesty.io/docs/seo-tools/canonical-tags/"
              target="_blank"
            >
              Enabling Canonical Tags
            </a>
          </small>
        ) : (
          <div>
            <Select
              name="canonicalTagMode"
              onSelect={(value, name) => {
                this.setState({ canonicalTagMode: value });
                this.props.onChange(Number(value), name);
              }}
              value={
                this.state.canonicalOptions[this.state.canonicalTagMode].value
              }
              options={this.state.canonicalOptions}
            >
              {this.state.canonicalOptions.map(opt => {
                return <Option value={opt.value} text={opt.text} />;
              })}
            </Select>

            {this.state.canonicalTagMode == "2" ? (
              <div className="setting-field custom">
                <label>Allowed query parameters (comma-separated)</label>
                <small className="desc">
                  Only list comma-separated parameter names. Do not include
                  values, ampersands, equals, or spaces.
                </small>
                <Input
                  type="text"
                  name="canonicalQueryParamWhitelist"
                  value={this.state.whitelist}
                  onChange={this.handleWhitelist}
                  placeholder="page,category"
                />
              </div>
            ) : null}

            {this.state.canonicalTagMode == "3" ? (
              <div className="setting-field custom">
                <label>Custom Path Value or URL</label>
                <small className="desc">
                  For Custom Paths: begin with a forward slash. For Custom URL:
                  begin with http:// or https://
                </small>
                <Input
                  type="text"
                  name="canonicalTagCustomValue"
                  value={this.state.custom}
                  onChange={this.handleCustom}
                  placeholder="/page/example/ or https://example.com/"
                />
              </div>
            ) : null}
          </div>
        )}
      </article>
    );
  }
}
