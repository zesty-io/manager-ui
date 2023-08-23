import { Button, Menu, MenuItem, Box } from "@mui/material";
import {
  useGetContentItemVersionsQuery,
  useGetItemPublishingsQuery,
  useGetLangsQuery,
} from "../../../../../../../../shell/services/instance";
import { useHistory, useLocation, useParams } from "react-router";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ContentItem } from "../../../../../../../../shell/services/types";
import { AppState } from "../../../../../../../../shell/store/types";
import { selectLang } from "../../../../../../../../shell/store/user";

const getCountryCode = (langCode: string) => {
  const splitTag = langCode.split("-");
  const countryCode =
    splitTag.length === 2 ? splitTag[1] : langCode.toUpperCase();
  return countryCode;
};

const getFlagEmojiFromIETFTag = (langCode: string) => {
  const countryCode = getCountryCode(langCode);

  // Convert country code to flag emoji.
  // Unicode flag emojis are made up of regional indicator symbols, which are a sequence of two letters.
  const baseOffset = 0x1f1e6;
  return (
    String.fromCodePoint(baseOffset + (countryCode.charCodeAt(0) - 65)) +
    String.fromCodePoint(baseOffset + (countryCode.charCodeAt(1) - 65))
  );
};

export const LanguageSelector = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: versions } = useGetContentItemVersionsQuery({
    modelZUID,
    itemZUID,
  });
  const { data: itemPublishings } = useGetItemPublishingsQuery({
    modelZUID,
    itemZUID,
  });
  const { data: languages } = useGetLangsQuery({});

  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );

  const onSelect = (langId: string) => {
    dispatch(selectLang(langId));

    // If we are at a content item level then reload newly selected language item
    const parts = location.pathname.split("/");
    if (parts[3]) {
      const subpath = parts.slice(0, 3);
      // @ts-ignore
      subpath.push(item.siblings[langId]);
      history.push(`${subpath.join("/")}`);
    }
  };

  const activeLanguage = languages?.find(
    (lang) => lang.ID === item?.meta?.langID
  ) || {
    code: "en-US",
  };

  return (
    <>
      <Button
        sx={{
          color: "text.disabled",
          height: "24px",
          minWidth: "unset",
          padding: "2px",
          " .MuiButton-endIcon": {
            marginLeft: "4px",
          },
        }}
        color="inherit"
        endIcon={<KeyboardArrowDownRounded color="action" />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Box component="span" color="text.primary">
          {getFlagEmojiFromIETFTag(activeLanguage?.code)}
        </Box>{" "}
        {activeLanguage?.code?.split("-")[0]?.toUpperCase()} (
        {getCountryCode(activeLanguage?.code)})
      </Button>
      <Menu
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: -8,
          horizontal: "right",
        }}
        anchorEl={anchorEl}
        open={!!anchorEl}
        PaperProps={{
          style: {
            width: "280px",
          },
        }}
      >
        {languages?.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => {
              setAnchorEl(null);
              onSelect(language.code);
            }}
          >
            {getFlagEmojiFromIETFTag(language.code)}{" "}
            {language.code.split("-")[0]?.toUpperCase()} (
            {getCountryCode(language.code)})
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
