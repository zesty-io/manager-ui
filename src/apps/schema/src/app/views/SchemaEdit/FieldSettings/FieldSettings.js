import { Fragment } from "react";
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
  faCalendarAlt,
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
  const field = FIELD_TYPES.find(
    (field) => field.value === props.field.datatype
  );

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
            {...(props.new
              ? { value: props.field.label }
              : { defaultValue: props.field.label })}
            maxLength="200"
            onChange={(val, key) => {
              if (props.new && props.updateMultipleValues) {
                props.updateMultipleValues({
                  [key]: val, // dynamic property key, name of field
                  name: formatName(val), // literal name key
                });
              } else {
                props.updateValue(formatName(val), key);
              }
            }}
          />
          <FieldTypeText
            className={styles.Setting}
            name="name"
            label="Field Name (Parsley Code Reference). Can not contain spaces, uppercase or special characters."
            {...(props.new
              ? { value: props.field.name }
              : { defaultValue: props.field.name })}
            maxLength="50"
            onChange={(val, name) => {
              props.updateValue(formatName(val), name);
            }}
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
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </Fragment>
    ),
    description: (
      <Fragment>
        <p>
          Text fields are limited to 150 characters and are useful for short
          content.
        </p>
        <em>e.g. Titles</em>
      </Fragment>
    ),
    title: "Text",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;Text
      </Fragment>
    ),
  },
  {
    value: "textarea",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </Fragment>
    ),
    description:
      "Textarea fields are useful for unstructured large chunks of text. They provide more character length than a text field but exclude the styling control of a WYSIWYG field. Textarea content is stored raw without going through any processing.",
    title: "Textarea",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;TextArea
      </Fragment>
    ),
  },
  {
    value: "wysiwyg_basic",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </Fragment>
    ),
    description: (
      <Fragment>
        <p>
          <abbr title="What You See Is What You Get">WYSIWYG</abbr> fields allow
          an editor styling and structuring of their content. This field type is
          also able to be viewed as a Markdown, Inline or HTML editor, giving
          authors control over their experience.
        </p>
      </Fragment>
    ),
    title: "WYSIWYG",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;WYSIWYG
      </Fragment>
    ),
  },
  {
    value: "markdown",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </Fragment>
    ),
    description: (
      <Fragment>
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
      </Fragment>
    ),
    title: "Markdown",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;Markdown
      </Fragment>
    ),
  },
  {
    value: "article_writer",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
      </Fragment>
    ),
    description: (
      <Fragment>
        <p>
          Article Writer fields provide an inline editor that allows a subset of
          styling and structuring elements. This field type is also able to be
          viewed as a Markdown, Inline or HTML editor. Giving authors control
          over their experience.
        </p>
      </Fragment>
    ),
    title: "Article Writer",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faParagraph} />
        &nbsp;Article Writer
      </Fragment>
    ),
  },
  {
    value: "images",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faImages} />
      </Fragment>
    ),
    description: (
      <Fragment>
        <p>
          Media fields allow the selection of media from this instances
          available media assets. This field can have a limit on how many assets
          can be selected as well as can be locked to a specific group from the
          media app.
        </p>
      </Fragment>
    ),
    title: "Media",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faImages} />
        &nbsp;Media
      </Fragment>
    ),
  },
  {
    value: "date",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faCalendar} />
      </Fragment>
    ),
    description: (
      <Fragment>
        <p>
          Date fields allow authors to select a date that will be guaranteed to
          be in a structured format.
        </p>
      </Fragment>
    ),
    title: "Date",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faCalendar} />
        &nbsp;Date
      </Fragment>
    ),
  },
  {
    value: "datetime",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faCalendarAlt} />
      </Fragment>
    ),
    description: (
      <Fragment>
        <p>
          Date &amp; Time fields allow authors to select a date and time that
          will be guaranteed to be in a structured format.
        </p>
      </Fragment>
    ),
    title: "Date & Time",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faCalendarAlt} />
        &nbsp;Date &amp; Time
      </Fragment>
    ),
  },
  {
    value: "dropdown",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faList} />
      </Fragment>
    ),
    description: (
      <Fragment>
        <p>
          Dropdown fields offer the ability to provide a pre-defined set of
          options for authors to select from.
        </p>
      </Fragment>
    ),
    title: "Dropdown",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faList} />
        &nbsp;Dropdown
      </Fragment>
    ),
  },
  {
    value: "one_to_one",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faArrowsAltH} />
      </Fragment>
    ),
    description:
      "One to one relationships allow content editors to connect another models content to this one by selecting the other item based upon one of it's fields. This provides the ability to resolve this relationship within a template or the SDK and gain access to the related item data.",
    title: "Related: One to One",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faArrowsAltH} />
        &nbsp;Related: One to One
      </Fragment>
    ),
  },
  {
    value: "one_to_many",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faSitemap} />
      </Fragment>
    ),
    description:
      "Many to one relationships allows content editors to connect many items from another model to this one by selecting the other items based upon one of their fields. This provides the ability to resolve the relationships within a template or the SDK and gain access to the related items data.",
    title: "Related: Many to One",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faSitemap} />
        &nbsp;Related: Many to one
      </Fragment>
    ),
  },
  {
    value: "link",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faExternalLinkAlt} />
      </Fragment>
    ),
    description: (
      <Fragment>
        <p>
          External URL fields provide content authors an input allowing for
          external domain urls.
        </p>
      </Fragment>
    ),
    title: "External URL",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faExternalLinkAlt} />
        &nbsp;External URL
      </Fragment>
    ),
  },
  {
    value: "internal_link",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faLink} />
      </Fragment>
    ),
    description: (
      <Fragment>
        <p>
          Internal Link fields allow for the selection of an internal instance
          item from any schema. This can be useful for providing authors the
          ability to relate an item across an instance.
        </p>
      </Fragment>
    ),
    title: "Internal Link",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faLink} />
        &nbsp;Internal Link
      </Fragment>
    ),
  },
  {
    value: "yes_no",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faToggleOn} />
      </Fragment>
    ),
    description: "",
    title: "Toggle",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faToggleOn} />
        &nbsp;Toggle
      </Fragment>
    ),
  },
  {
    value: "number",
    icon: (
      <Fragment>
        <i>+0</i>
      </Fragment>
    ),
    description: "",
    title: "Number",
    html: "<i>+0</i>&nbsp;Number",
  },
  {
    value: "color",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faPalette} />
      </Fragment>
    ),
    description: "",
    title: "Color",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faPalette} />
        &nbsp;Color
      </Fragment>
    ),
  },
  {
    value: "sort",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faSortNumericUp} />
      </Fragment>
    ),
    description: "",
    title: "Sort",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faSortNumericUp} />
        &nbsp;Sort
      </Fragment>
    ),
  },
  {
    value: "currency",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faMoneyBillAlt} />
      </Fragment>
    ),
    description: "",
    title: "Currency",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faMoneyBillAlt} />
        &nbsp;Currency
      </Fragment>
    ),
  },
  {
    value: "uuid",
    icon: (
      <Fragment>
        <FontAwesomeIcon icon={faIdCard} />
      </Fragment>
    ),
    description: "",
    title: "UUID",
    component: (
      <Fragment>
        <FontAwesomeIcon icon={faIdCard} />
        &nbsp;UUID
      </Fragment>
    ),
  },
];
