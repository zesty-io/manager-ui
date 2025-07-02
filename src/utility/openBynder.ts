export default ({
  url,
  onSuccess = () => {},
  mode = "MultiSelect",
}: {
  url: string;
  onSuccess?: (assets: ReadonlyArray<BynderImage>) => void;
  mode?: BynderMode;
}) => {
  BynderCompactView.open({
    portal: { url },
    mode,
    onSuccess,
  });
};
