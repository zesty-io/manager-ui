import React, { useReducer, createContext, Dispatch } from "react";

type CommentContextType = [
  Record<string, string>,
  Dispatch<Record<string, string>>
];
export const CommentContext = createContext<CommentContextType>([{}, () => {}]);

type CommentProviderType = {
  children?: React.ReactNode;
};
export const CommentProvider = ({ children }: CommentProviderType) => {
  const [comments, updateComments] = useReducer(
    (state: Record<string, string>, action: Record<string, string>) => {
      return {
        ...state,
        ...action,
      };
    },
    {}
  );

  return (
    <CommentContext.Provider value={[comments, updateComments]}>
      {children}
    </CommentContext.Provider>
  );
};
