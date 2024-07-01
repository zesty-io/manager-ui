import React, { useReducer, createContext, useState, Dispatch } from "react";

type CommentContextType = [
  Record<string, string>,
  Dispatch<Record<string, string>>,
  string,
  Dispatch<string>
];
export const CommentContext = createContext<CommentContextType>([
  {},
  () => {},
  null,
  () => {},
]);

type CommentProviderType = {
  children?: React.ReactNode;
};
export const CommentProvider = ({ children }: CommentProviderType) => {
  const [commentZUIDtoEdit, setCommentZUIDtoEdit] = useState(null);
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
    <CommentContext.Provider
      value={[
        comments,
        updateComments,
        commentZUIDtoEdit,
        setCommentZUIDtoEdit,
      ]}
    >
      {children}
    </CommentContext.Provider>
  );
};
