import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAsterisk,
  faBold,
  faItalic,
  faCode,
  faSuperscript,
  faSubscript,
  faUnderline,
  faStrikethrough,
  faLink,
  faParagraph,
  faHeading,
  faQuoteLeft,
  faListOl,
  faListUl,
  faImage,
  faTable,
  faUndo,
  faRedo,
  faOutdent,
  faIndent,
  faAngleUp,
  faAlignLeft,
  faAlignRight,
  faAlignCenter,
  faAlignJustify,
  faArrowCircleLeft,
  faArrowCircleRight,
} from "@fortawesome/free-solid-svg-icons";

export default {
  em: <FontAwesomeIcon icon={faItalic} />,
  italic: <FontAwesomeIcon icon={faItalic} />,
  strong: <FontAwesomeIcon icon={faBold} />,
  bold: <FontAwesomeIcon icon={faBold} />,
  code: <FontAwesomeIcon icon={faCode} />,
  subscript: <FontAwesomeIcon icon={faSubscript} />,
  superscript: <FontAwesomeIcon icon={faSuperscript} />,
  underline: <FontAwesomeIcon icon={faUnderline} />,
  strikethrough: <FontAwesomeIcon icon={faStrikethrough} />,
  link: <FontAwesomeIcon icon={faLink} />,
  paragraph: <FontAwesomeIcon icon={faParagraph} />,
  heading: <FontAwesomeIcon icon={faHeading} />,
  blockquote: <FontAwesomeIcon icon={faQuoteLeft} />,
  code_block: <FontAwesomeIcon icon={faCode} />,
  ordered_list: <FontAwesomeIcon icon={faListOl} />,
  bullet_list: <FontAwesomeIcon icon={faListUl} />,
  image: <FontAwesomeIcon icon={faImage} />,
  table: <FontAwesomeIcon icon={faTable} />,
  footnote: <FontAwesomeIcon icon={faAsterisk} />,
  undo: <FontAwesomeIcon icon={faUndo} />,
  redo: <FontAwesomeIcon icon={faRedo} />,
  outdent: <FontAwesomeIcon icon={faOutdent} />,
  indent: <FontAwesomeIcon icon={faIndent} />,
  join_up: <FontAwesomeIcon icon={faAngleUp} />,

  align_left: <FontAwesomeIcon icon={faAlignLeft} />,
  align_right: <FontAwesomeIcon icon={faAlignRight} />,
  align_center: <FontAwesomeIcon icon={faAlignCenter} />,
  align_justify: <FontAwesomeIcon icon={faAlignJustify} />,

  float_left: <FontAwesomeIcon icon={faArrowCircleLeft} />,
  float_right: <FontAwesomeIcon icon={faArrowCircleRight} />,
};