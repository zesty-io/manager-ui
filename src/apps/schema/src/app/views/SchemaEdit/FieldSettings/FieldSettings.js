import React from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faParagraph,
  faImages,
  faCalendar,
  faList,
  faArrowsAltH,
  faSitemap,
  faExternalLinkAlt,
  faLink,
  faToggleOn,
  faPalette,
  faSortNumericUp,
  faMoneyBillAlt,
  faIdCard,
  faExclamationTriangle,
  faImage,
  faCalendarTimes,
  faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";

import { Url } from "@zesty-io/core/Url";

import { DropdownOptions } from "./DropdownOptions";
import { ToggleOptions } from "./ToggleOptions";
import { RelatedOptions } from "./RelatedOptions";
import { ImageOptions } from "./ImageOptions";

import { formatName } from "utility/formatName";

import styles from "./FieldSettings.less";
export default function FieldSettings(props) {
  const field = FIELD_TYPES.find(field => field.value === props.field.datatype);

  return (
    <div className={cx(styles.DefaultSettings, props.className)}>
      {field && (
        <aside className={styles.Description}>{field.description}</aside>
      )}

      {!field && (
        <aside className={cx(styles.Description, styles.Warn)}>
          <FontAwesomeIcon
            className={styles.Icon}
            icon={faExclamationTriangle}
          />
          <p>
            The <code>{`${props.field.datatype}`}</code> field type is
            deprecated. Don't be alarmed, it just means we do not allow the
            creation of this type of field anymore. Sometimes this is due to
            external vendor changes requiring a change in Zesty or we
            occasionally alter fields to simplify the authoring experience.
          </p>
        </aside>
      )}

      <div className={styles.Columns}>
        <div className={styles.Column}>
          <FieldTypeText
            className={styles.Setting}
            name="label"
            label="Field Label"
            defaultValue={props.field.label}
            maxLength="200"
            onChange={(val, key) => {
              if (props.new && props.updateMultipleValues) {
                props.updateMultipleValues({
                  [key]: val, // dynamic property key, name of field
                  name: formatName(val) // literal name key
                });
              } else {
                props.updateValue(val, key);
              }
            }}
          />
          <FieldTypeText
            className={styles.Setting}
            name="name"
            label="Field Name (Parsley Code Reference). Can not contain spaces, uppercase or special characters."
            defaultValue={props.field.name}
            maxLength="50"
            onChange={(val, name) => props.updateValue(formatName(val), name)}
          />

          <FieldTypeBinary
            className={styles.Setting}
            name="required"
            label="Is this field required?"
            offValue="No"
            onValue="Yes"
            value={Number(props.field.required)}
            onChange={() =>
              props.updateValue(!Boolean(props.field.required), "required")
            }
          />

          <FieldTypeBinary
            className={styles.Setting}
            name="list"
            label="Show this value in the table listing view?"
            offValue="No"
            onValue="Yes"
            value={Number(props.field.settings.list)}
            onChange={() =>
              props.updateFieldSetting(
                !Boolean(props.field.settings.list),
                "list"
              )
            }
          />
        </div>
        <div className={styles.Column}>
          <FieldTypeText
            className={styles.Setting}
            name="tooltip"
            maxLength="250"
            label="Tool tip displayed to content editors"
            defaultValue={props.field.settings.tooltip}
            onChange={props.updateFieldSetting}
          />

          <FieldTypeTextarea
            className={styles.Setting}
            name="description"
            label="Description displayed to content editors"
            defaultValue={props.field.description}
            maxLength="250"
            onChange={props.updateValue}
          />
        </div>
      </div>

      {props.field.datatype === "images" && <ImageOptions {...props} />}
      {props.field.datatype === "dropdown" && <DropdownOptions {...props} />}
      {props.field.datatype === "yes_no" && <ToggleOptions {...props} />}
      {(props.field.datatype === "one_to_one" ||
        props.field.datatype === "one_to_many") && (
        <RelatedOptions {...props} />
      )}
    </div>
  );
}

export const FIELD_TYPES = [
  {
    value: "text",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          Text fields are limited to 150 characters and are useful for short
          content.
        </p>
        <em>e.g. Titles</em>
      </React.Fragment>
    ),
    title: "Text",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;Text
      </React.Fragment>
    )
  },
  {
    value: "textarea",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </React.Fragment>
    ),
    description:
      "Textarea fields are useful for unstructured large chunks of text. They provide more character length than a text field but exclude the styling control of a WYSIWYG field. Textarea content is stored raw without going through any processing.",
    title: "Textarea",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;TextArea
      </React.Fragment>
    )
  },
  {
    value: "wysiwyg_basic",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          <abbr title="What You See Is What You Get">WYSIWYG</abbr> fields allow
          an editor styling and structuring of their content. This field type is
          also able to be viewed as a Markdown, Inline or HTML editor, giving
          authors control over their experience.
        </p>
      </React.Fragment>
    ),
    title: "WYSIWYG",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;WYSIWYG
      </React.Fragment>
    )
  },
  {
    value: "markdown",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          Markdown fields provide an editor that allows using{" "}
          <Url
            title="Learn more about Github Flavored Markdown"
            target="_blank"
            href="https://github.github.com/gfm/"
          >
            Github Flavored Markdown
          </Url>{" "}
          syntax for styling and structuring of content. This field type is also
          able to be viewed as a WYSIWYG, Inline or HTML editor. Giving authors
          control over their experience.
        </p>
      </React.Fragment>
    ),
    title: "Markdown",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;Markdown
      </React.Fragment>
    )
  },
  {
    value: "article_writer",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          Article Writer fields provide an inline editor that allows a subset of
          styling and structuring elements. This field type is also able to be
          viewed as a Markdown, Inline or HTML editor. Giving authors control
          over their experience.
        </p>
      </React.Fragment>
    ),
    title: "Article Writer",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;Article Writer
      </React.Fragment>
    )
  },
  {
    value: "images",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faImages} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          Media fields allow the selection of media from this instances
          available media assets. This field can have a limit on how many assets
          can be selected as well as can be locked to a specific group from the
          media app.
        </p>
      </React.Fragment>
    ),
    title: "Media",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faImages} />
        &nbsp;Media
      </React.Fragment>
    )
  },
  {
    value: "date",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faCalendar} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          Date fields allow authors to select a date that will be guaranteed to
          be in a structured format.
        </p>
      </React.Fragment>
    ),
    title: "Date",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faCalendar} />
        &nbsp;Date
      </React.Fragment>
    )
  },
  {
    value: "datetime",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faCalendarAlt} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          Date &amp; Time fields allow authors to select a date and time that
          will be guaranteed to be in a structured format.
        </p>
      </React.Fragment>
    ),
    title: "Date & Time",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faCalendarAlt} />
        &nbsp;Date &amp; Time
      </React.Fragment>
    )
  },
  {
    value: "dropdown",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faList} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          Dropdown fields offer the ability to provide a pre-defined set of
          options for authors to select from.
        </p>
      </React.Fragment>
    ),
    title: "Dropdown",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faList} />
        &nbsp;Dropdown
      </React.Fragment>
    )
  },
  {
    value: "one_to_one",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faArrowsAltH} />
      </React.Fragment>
    ),
    description:
      "One to one relationships allow content editors to connect another models content to this one by selecting the other item based upon one of it's fields. This provides the ability to resolve this relationship within a template or the SDK and gain access to the related item data.",
    title: "Related: One to One",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faArrowsAltH} />
        &nbsp;Related: One to One
      </React.Fragment>
    )
  },
  {
    value: "one_to_many",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faSitemap} />
      </React.Fragment>
    ),
    description:
      "Many to one relationships allows content editors to connect many items from another model to this one by selecting the other items based upon one of their fields. This provides the ability to resolve the relationships within a template or the SDK and gain access to the related items data.",
    title: "Related: Many to One",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faSitemap} />
        &nbsp;Related: Many to one
      </React.Fragment>
    )
  },
  {
    value: "link",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faExternalLinkAlt} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          External URL fields provide content authors an input allowing for
          external domain urls.
        </p>
      </React.Fragment>
    ),
    title: "External URL",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faExternalLinkAlt} />
        &nbsp;External URL
      </React.Fragment>
    )
  },
  {
    value: "internal_link",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faLink} />
      </React.Fragment>
    ),
    description: (
      <React.Fragment>
        <p>
          Internal Link fields allow for the selection of an internal instance
          item from any schema. This can be useful for providing authors the
          ability to relate an item across an instance.
        </p>
      </React.Fragment>
    ),
    title: "Internal Link",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faLink} />
        &nbsp;Internal Link
      </React.Fragment>
    )
  },
  {
    value: "yes_no",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faToggleOn} />
      </React.Fragment>
    ),
    description: "",
    title: "Toggle",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faToggleOn} />
        &nbsp;Toggle
      </React.Fragment>
    )
  },
  {
    value: "number",
    icon: (
      <React.Fragment>
        <i>+0</i>
      </React.Fragment>
    ),
    description: "",
    title: "Number",
    html: "<i>+0</i>&nbsp;Number"
  },
  {
    value: "color",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faPalette} />
      </React.Fragment>
    ),
    description: "",
    title: "Color",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faPalette} />
        &nbsp;Color
      </React.Fragment>
    )
  },
  {
    value: "sort",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faSortNumericUp} />
      </React.Fragment>
    ),
    description: "",
    title: "Sort",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faSortNumericUp} />
        &nbsp;Sort
      </React.Fragment>
    )
  },
  {
    value: "currency",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faMoneyBillAlt} />
      </React.Fragment>
    ),
    description: "",
    title: "Currency",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faMoneyBillAlt} />
        &nbsp;Currency
      </React.Fragment>
    )
  },
  {
    value: "uuid",
    icon: (
      <React.Fragment>
        <FontAwesomeIcon icon={faIdCard} />
      </React.Fragment>
    ),
    description: "",
    title: "UUID",
    component: (
      <React.Fragment>
        <FontAwesomeIcon icon={faIdCard} />
        &nbsp;UUID
      </React.Fragment>
    )
  }
];
