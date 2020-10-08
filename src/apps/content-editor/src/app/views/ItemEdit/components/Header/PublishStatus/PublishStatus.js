import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import styles from "./PublishStatus.less";
// export class LiveUrl extends React.Component {
//   render() {
//     // TODO fix instance protocol and prefix
//     // const urlString = `${this.props.instance.protocol}://${
//     //   this.props.instance.prefix == 1 ? "www." : ""
//     // }${this.props.instance.domain}${
//     //   this.props.item.web.pathPart !== "zesty_home"
//     //     ? this.props.item.web.path
//     //     : ""
//     // }`;

//     const urlString = `http://${this.props.instance.domain}${
//       this.props.item.web.pathPart !== "zesty_home"
//         ? this.props.item.web.path
//         : ""
//     }`;

//     const isPublished =
//       this.props.item.publishing && this.props.item.publishing.isPublished;

//     // {props.item.web.path &&
//     //   (props.instance.domain ? (
//     //     <ItemUrl item={props.item} instance={props.instance} />
//     //   ) : (
//     //     <Url
//     //       target="_blank"
//     //       href={`${CONFIG.URL_ACCOUNTS}/instances/${props.modelZUID}/launch`}
//     //     >
//     //       <FontAwesomeIcon icon={faRocket} />
//     //       &nbsp;Launch Instance
//     //     </Url>
//     //   ))}

//     return (
//       <article className={styles.PublicLink}>
//         {!isPublished && (
//           <small className={styles.pubMessage}>[Unpublished]</small>
//         )}
//       </article>
//     );
//   }
// }

export function PublishStatus(props) {
  return props.item.publishing && props.item.publishing.isPublished ? (
    <span>published</span>
  ) : (
    <span>unpublished</span>
  );
}
