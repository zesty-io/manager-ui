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
      /* 
        In Safari, setting the cursor position can cause the input to refocus, 
        leading to a poor user experience if the input isn't already focused.
        This conditional check ensures the cursor position is only set if the input is focused,
        preventing unnecessary refocusing on value changes, which is a problem in Safari.
      */
      if (document.activeElement === inputRef.current) {
        inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCursorPosition(e.target.selectionStart || 0);

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
