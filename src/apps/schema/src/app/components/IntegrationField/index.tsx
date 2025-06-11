import { FC, useEffect, useState } from "react";
import { Box, Typography, Button, Paper, InputBase } from "@mui/material";
import { IntegrationFieldTypes } from "../configs";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ConnectForm from "./ConnectForm";
import { useIntegrationField } from "./IntegrationFieldProvider";

type IntegrationDataProps = {
  url: string;
  // type: IntegrationFieldTypes;
};

type IntegrationFieldProps = {
  name: string;
  label: string;
  // data?: IntegrationDataProps;
};

const IntegrationField: FC<IntegrationFieldProps> = ({ name, label }) => {
  const [isConnectFormOpen, setIsConnectFormOpen] = useState(false);

  const { openConnectForm, data, setData } = useIntegrationField();

  useEffect(() => {
    console.debug("INTEGRATION MOUNTED");
    return () => {
      console.debug("INTEGRATION UNMOUNTED");
      setData(null);
    };
  }, []);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {!!data && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "100%",
              py: 1,
              rowGap: 1,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              API Configuration Settings
            </Typography>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                width: "100%",
                bgcolor: "background.paper",
                borderColor: "border",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "border",
                }}
              >
                <Typography
                  width={200}
                  variant="body2"
                  fontWeight={600}
                  flexGrow={0}
                  flexShrink={0}
                >
                  API URL
                </Typography>
                <InputBase
                  readOnly
                  value={data?.url || "https://api.nba.com/players.json"}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  p: 2,
                }}
              >
                <Typography
                  width={200}
                  variant="body2"
                  fontWeight={600}
                  flexGrow={0}
                  flexShrink={0}
                >
                  Display Items as
                </Typography>
                <InputBase
                  readOnly
                  value={`${data?.type || "Simple"} Card`}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            </Paper>
          </Box>
        )}
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={!!data ? <AutorenewRoundedIcon /> : <LinkRoundedIcon />}
          onClick={openConnectForm}
        >
          {!!data ? "Reconfigure" : "Connect to API"}
        </Button>
      </Box>
    </>
  );
};

export default IntegrationField;
