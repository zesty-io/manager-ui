import { ComponentType, useEffect, useState, useRef } from "react";

export const withCursorPosition =
  (WrappedComponent: ComponentType) => (props: any) => {
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCursorPosition(e.target.selectionStart);

      props.onChange(e);
    };

    return (
      <WrappedComponent
        {...props}
        inputRef={inputRef}
        onChange={handleChange}
      />
    );
  };
