import { forwardRef } from "react";
import {
  NumericFormatProps,
  InputAttributes,
  NumericFormat,
  NumberFormatValues,
} from "react-number-format";

export type NumberFormatInputEvent = {
  target: {
    name: string;
    value: NumberFormatValues;
  };
};
type NumberFormatInputProps = {
  onChange: (event: NumberFormatInputEvent) => void;
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
            value: values,
          },
        });
      }}
    />
  );
});
