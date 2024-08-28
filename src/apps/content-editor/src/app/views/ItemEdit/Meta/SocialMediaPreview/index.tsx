import { useState } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import { Google, Twitter, Facebook, LinkedIn } from "@mui/icons-material";
import { GooglePreview } from "./GooglePreview";
import { TwitterPreview } from "./TwitterPreview";
import { FacebookPreview } from "./FacebookPreview";
import { LinkedInPreview } from "./LinkedInPreview";

enum SocialMediaTab {
  Google,
  Twitter,
  Facebook,
  LinkedIn,
}
type SocialMediaPreviewProps = {};
export const SocialMediaPreview = ({}: SocialMediaPreviewProps) => {
  const [activeTab, setActiveTab] = useState<SocialMediaTab>(
    SocialMediaTab.Google
  );

  return (
    <>
      <Box
        sx={{
          mb: 1.5,
          borderBottom: (theme) => `2px solid ${theme?.palette?.border} `,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{
            position: "relative",
            top: "2px",
          }}
        >
          <Tab
            icon={<Google />}
            iconPosition="start"
            label="Google"
            value={SocialMediaTab.Google}
          />
          <Tab
            icon={<Twitter />}
            iconPosition="start"
            label="Twitter (X)"
            value={SocialMediaTab.Twitter}
          />
          <Tab
            icon={<Facebook />}
            iconPosition="start"
            label="Facebook"
            value={SocialMediaTab.Facebook}
          />
          <Tab
            icon={<LinkedIn />}
            iconPosition="start"
            label="LinkedIn"
            value={SocialMediaTab.LinkedIn}
          />
        </Tabs>
      </Box>
      {activeTab === SocialMediaTab.Google && <GooglePreview />}
      {activeTab === SocialMediaTab.Twitter && <TwitterPreview />}
      {activeTab === SocialMediaTab.Facebook && <FacebookPreview />}
      {activeTab === SocialMediaTab.LinkedIn && <LinkedInPreview />}
    </>
  );
};
