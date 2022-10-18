import { useState, useRef } from "react";
import { CardMedia, Skeleton } from "@mui/material";

import { File } from "../../../../../../shell/services/types";

export function ThumbnailImage({
  src,
  file,
  document = false,
}: {
  src: string;
  file: File;
  document?: boolean;
}) {
  const imageEl = useRef<HTMLImageElement>();
  const [lazyLoading, setLazyLoading] = useState(true);
  const [imageOrientation, setImageOrientation] = useState<string>("");

  /**
   * @description Used to set vertical or horizontal image orientation
   * @note imageOrientation will be placed as a condition in the Image's parent component
   */
  const handleImageLoad = () => {
    setLazyLoading(false);
    // const naturalHeight = imageEl.current.naturalHeight;
    // const naturalWidth = imageEl.current.naturalWidth;
    // if (naturalHeight > naturalWidth) {
    //   setImageOrientation("vertical");
    // } else {
    //   setImageOrientation("horizontal");
    // }
  };

  const styleDoc = {
    overflow: "hidden",
    width: "34.41px",
    height: "32px",
    m: "auto",
    display: "table-cell",
    verticalAlign: "bottom",
  };

  const styleImage = {
    objectFit: "contain",
    overflow: "hidden",
    height: "100%",
    display: "table-cell",
    verticalAlign: "bottom",
  };

  return (
    <>
      <CardMedia
        component="img"
        ref={imageEl}
        onLoad={handleImageLoad}
        data-src={src}
        image={src}
        loading="lazy"
        sx={document ? styleDoc : styleImage}
      />

      {!file || lazyLoading ? (
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={200}
          height={160}
          sx={{
            position: "absolute",
            top: "0",
            left: "0",
          }}
        />
      ) : null}
    </>
  );
}
