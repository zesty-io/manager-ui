import { Box } from "@mui/material";
import { useParams } from "react-router";
import { useGetContentModelFieldsQuery } from "../../../../../shell/services/instance";

type Params = {
  id: string;
};

const Field = () => {
  return <Box height={200}></Box>;
};

export const Fields = ({ field }: any) => {
  const params = useParams<Params>();
  const { id } = params;
  const { data: fields } = useGetContentModelFieldsQuery(id);

  console.log("testing", fields);

  return <div>{/* {fields?.map((field) => <Field field={field} />)} */}</div>;
};
