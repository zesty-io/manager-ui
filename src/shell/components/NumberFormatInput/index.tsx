import { forwardRef } from "react";
import {
  NumericFormatProps,
  InputAttributes,
  NumericFormat,
} from "react-number-format";

type NumberFormatInputProps = {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
};
export const NumberFormatInput = forwardRef<
  NumericFormatProps<InputAttributes>,
  NumberFormatInputProps
>((props, ref) => {
  const { onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value || "0",
          },
        });
      }}
    />
  );
});
