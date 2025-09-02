import {
  ComponentType,
  useEffect,
  useState,
  useRef,
  forwardRef,
  MutableRefObject,
} from "react";

export const withCursorPosition = (WrappedComponent: ComponentType) =>
  forwardRef((props: any, ref: MutableRefObject<any>) => {
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCursorPosition(e.target.selectionStart);

      props.onChange && props.onChange(e);
    };

    return (
      <WrappedComponent
        {...props}
        ref={ref}
        inputRef={inputRef}
        onChange={handleChange}
      />
    );
  });
