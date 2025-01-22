import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  styled,
  CardActionArea,
  CardMedia,
  CardContent,
  alpha,
  Card,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import SearchIcon from "@mui/icons-material/Search";
import {
  ContentModelFieldDataType,
  FieldSettings,
} from "../../../../../shell/services/types";

import { StarterBlockForm } from "./StarterBlockForm";
import { NoResults } from "./NoResults";

type StarterBlocksDialogueProps = {
  onClose: () => void;
};

export type BlockFieldProps = {
  label: string;
  name: string;
  description: string;
  datatype: ContentModelFieldDataType;
  settings: FieldSettings;
};

export type BlockTypeProps = {
  label: string;
  image: string;
  name: string;
  description: string;
  fields: BlockFieldProps[];
};

const BLOCK_TYPES: BlockTypeProps[] = [
  {
    label: "Blank",
    image: "/images/block_blank.png",
    name: "blank",
    description: "A blank block",
    fields: [],
  },
  {
    label: "Side by Side Hero Image",
    image: "/images/block_hero_side_by_side_image.png",
    name: "side-by-side-hero-image",
    description:
      "A hero with text and CTA buttons on the left and an image on the right",
    fields: [
      {
        name: "title",
        label: "Title",
        description: "The primary heading displayed in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "Protect What Matters Most with ABC Insurance",
          list: true,
        },
      },
      {
        label: "Sub Title",
        name: "sub_title",
        description:
          "The supporting text displayed below the title in the left section.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "Discover personalized insurance plans designed to secure your future and give you peace of mind.",
          list: true,
        },
      },
      {
        label: "CTA Button 1 Text",
        name: "cta_button_1_text",
        description:
          "The text for the first call-to-action button in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "Get a Quote.",
          list: true,
        },
      },
      {
        label: "CTA Button 1 URL",
        name: "cta_button_1_url",
        description: "The URL the first call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/get-a-quote",
          list: true,
        },
      },
      {
        label: "CTA Button 2 Text",
        name: "cta_button_2_text",
        description:
          "The text for the second call-to-action button in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "Learn More",
          list: true,
        },
      },
      {
        label: "CTA Button 2 URL",
        name: "cta_button_2_url",
        description: "The URL the second call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/learn-more",
          list: true,
        },
      },
      {
        label: "Button Container Sub Text",
        name: "button_container_sub_text",
        description:
          "Supporting text below the call-to-action buttons in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "No hidden fees, no obligations.",
          list: true,
        },
      },
      {
        label: "Hero Image",
        name: "hero_image",
        description:
          "The image displayed on the right side of the hero section.",
        datatype: "images",
        settings: {
          defaultValue:
            "Image of an insurance company or family https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
      {
        label: "Star Rating Number",
        name: "star_rating_number",
        description: "A numerical rating displayed in the hero section.",
        datatype: "number",
        settings: {
          defaultValue: "4.8",
          list: true,
        },
      },
      {
        label: "Star Rating Title",
        name: "star_rating_title",
        description: "A title describing the star rating.",
        datatype: "text",
        settings: {
          defaultValue: "Customer Satisfaction",
          list: true,
        },
      },
      {
        label: "Star Rating Sub Text",
        name: "star_rating_sub_text",
        description: "Additional details about the star rating.",
        datatype: "text",
        settings: {
          defaultValue: "Rated by 5,000+ happy customers.",
          list: true,
        },
      },
    ],
  },
  {
    label: "Hero Image Below",
    name: "hero-image-below",
    description:
      "A hero with text and CTA buttons on the top and an image below",
    image: "/images/block_hero_image_below.png",
    fields: [
      {
        label: "Top CTA Button Text",
        name: "top_cta_button_text",
        description: "The text for the top call-to-action button.",
        datatype: "text",
        settings: {
          defaultValue: "Get Started",
          list: true,
        },
      },
      {
        label: "Top CTA Button URL",
        name: "top_cta_button_url",
        description: "The URL the top call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/get-started",
          list: true,
        },
      },
      {
        name: "title",
        label: "Title",
        description: "The primary heading displayed in the hero section.",
        datatype: "text",
        settings: {
          defaultValue: "Secure Your Future with ABC Insurance",
          list: true,
        },
      },
      {
        label: "Sub Title",
        name: "sub_title",
        description:
          "The supporting text displayed below the title in the hero section.",
        datatype: "textarea",
        settings: {
          defaultValue: "Affordable plans tailored to your needs.",
          list: true,
        },
      },
      {
        label: "CTA Button 1 Text",
        name: "cta_button_1_text",
        description: "The text for the first call-to-action button",
        datatype: "text",
        settings: {
          defaultValue: "Get a Quote.",
          list: true,
        },
      },
      {
        label: "CTA Button 1 URL",
        name: "cta_button_1_url",
        description: "The URL the first call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/get-a-quote",
          list: true,
        },
      },
      {
        label: "CTA Button 2 Text",
        name: "cta_button_2_text",
        description: "The text for the second call-to-action button.",
        datatype: "text",
        settings: {
          defaultValue: "Learn More",
          list: true,
        },
      },
      {
        label: "CTA Button 2 URL",
        name: "cta_button_2_url",
        description: "The URL the second call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/learn-more",
          list: true,
        },
      },
      {
        label: "Hero Image",
        name: "hero_image",
        description: "The image displayed in the hero section.",
        datatype: "images",
        settings: {
          defaultValue:
            "An image of an insurance company like this https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
    ],
  },
  {
    label: "Contact Us Form",
    name: "contact-us-form",
    description: "",
    image: "/images/block_contact_us_form.png",
    fields: [
      {
        label: "Title",
        name: "title",
        description: "The main heading for the contact us form.",
        datatype: "text",
        settings: {
          defaultValue: "Get in Touch",
          list: true,
        },
      },
      {
        label: "Body Text",
        name: "body_text",
        description:
          "A detailed text providing context or instructions for the form.",
        datatype: "wysiwyg_basic",
        settings: {
          defaultValue:
            "Have questions? Reach out to us, and we’ll get back to you shortly.",
          list: true,
        },
      },
      {
        label: "Name",
        name: "name",
        description: "A label for the name input field.",
        datatype: "text",
        settings: {
          defaultValue: "Your Name",
          list: true,
        },
      },
      {
        label: "Person Name",
        name: "person_name",
        description: "The name of the primary contact person.",
        datatype: "text",
        settings: {
          defaultValue: "Sarah Johnson",
          list: true,
        },
      },
      {
        label: "Person Title",
        name: "person_title",
        description: "The title or role of the primary contact person.",
        datatype: "text",
        settings: {
          defaultValue: "Customer Support Specialist",
          list: true,
        },
      },
      {
        label: "Person Email",
        name: "person_email",
        description: "The email address of the primary contact person.",
        datatype: "text",
        settings: {
          defaultValue: "support@abcinsurance.com",
          list: true,
        },
      },
      {
        label: "Person Photo",
        name: "person_photo",
        description: "A photo of the primary contact person.",
        datatype: "images",
        settings: {
          defaultValue:
            "Photo of a Lady like this https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
      {
        label: "Form Header Text",
        name: "form_header_text",
        description: "A subheading or introduction for the contact form.",
        datatype: "text",
        settings: {
          defaultValue: "We're here to help!",
          list: true,
        },
      },
      {
        label: "Form CTA Button Text",
        name: "form_cta_button_text",
        description: "The text for the call-to-action button on the form.",
        datatype: "text",
        settings: {
          defaultValue: "Submit",
          list: true,
        },
      },
    ],
  },
  {
    label: "Feature Side By Side Image",
    name: "feature-side-by-side-image",
    description: "A feature with text on the left and image on the right",
    image: "/images/block_feature_side_by_side_image.png",
    fields: [
      {
        label: "Feature Intro Text",
        name: "feature_intro_text",
        description: "A short introductory text for the feature section.",
        datatype: "text",
        settings: {
          defaultValue: "Discover our unique insurance features",
          list: true,
        },
      },
      {
        label: "Feature Intro Link",
        name: "feature_intro_link",
        description: "The URL linked to the introductory feature text.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/features",
          list: true,
        },
      },
      {
        label: "Title",
        name: "title",
        description: "The main heading for the feature section.",
        datatype: "text",
        settings: {
          defaultValue: "Comprehensive Coverage Plans",
          list: true,
        },
      },
      {
        label: "Sub Title",
        name: "sub_title",
        description:
          "The supporting text providing more detail about the feature.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "Tailored insurance plans to fit your needs and budget, giving you complete peace of mind.",
          list: true,
        },
      },
      {
        label: "CTA Button Text",
        name: "cta_button_text",
        description:
          "The text for the call-to-action button in the feature section.",
        datatype: "text",
        settings: {
          defaultValue: "Learn About Features",
          list: true,
        },
      },
      {
        label: "CTA Button URL",
        name: "cta_button_url",
        description: "The URL the call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/learn-features",
          list: true,
        },
      },
      {
        label: "Hero Image",
        name: "hero_image",
        description: "The image displayed alongside the feature section.",
        datatype: "images",
        settings: {
          defaultValue:
            "Image of a person working with another person at a desk like this https://images.unsplash.com/photo-1573496267526-08a69e46a409?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
    ],
  },
  {
    label: "Single Testimonial",
    name: "single-testimonial",
    description:
      "A single testimonial quote with a person's name, image, and company details",
    image: "/images/block_single_testimonial.png",
    fields: [
      {
        label: "Quote",
        name: "quote",
        description: "The testimonial or quote provided by a person.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "ABC Insurance has transformed my life with its reliable and affordable plans.",
          list: true,
        },
      },
      {
        label: "Person Image",
        name: "person_image",
        description: "The image of the person providing the quote.",
        datatype: "images",
        settings: {
          defaultValue:
            "Image of a Person like this https://images.unsplash.com/photo-1717533564570-4ea91a5df160?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          list: true,
        },
      },
      {
        label: "Person Name",
        name: "person_name",
        description: "The name of the person providing the quote.",
        datatype: "text",
        settings: {
          defaultValue: "John Doe",
          list: true,
        },
      },
      {
        label: "Job Title",
        name: "job_title",
        description: "The job title of the person providing the quote.",
        datatype: "text",
        settings: {
          defaultValue: "Financial Advisor",
          list: true,
        },
      },
      {
        label: "Position",
        name: "position",
        description: "The person's position in their company.",
        datatype: "text",
        settings: {
          defaultValue: "Senior Manager",
          list: true,
        },
      },
      {
        label: "Company Name",
        name: "company_name",
        description: "The name of the company the person represents.",
        datatype: "text",
        settings: {
          defaultValue: "ABC Insurance",
          list: true,
        },
      },
      {
        label: "Company Logo",
        name: "company_logo",
        description: "The logo of the company the person represents.",
        datatype: "images",
        settings: {
          defaultValue: "Stock Company Logo... could use the Zesty Logo",
          list: true,
        },
      },
    ],
  },
];

const CardStyles = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  border: "1px solid",
  borderColor: theme.palette.grey[100],
  boxShadow: "none",
  width: "100%",
  aspectRatio: "1/.8",
  backgroundColor: theme.palette.grey[100],
  position: "relative",
  "&.active": {
    outline: "2px solid",
    outlineColor: theme.palette.primary.main,
    outlineOffset: "-1px",
    "& .MuiCardContent-root": {
      backgroundColor: alpha(theme.palette.primary.light, 0.3),
      "& .card-content": {
        opacity: 0.8,
      },
    },
  },
}));

const BlockItem = ({
  block,
  isActive,
  onClick,
}: {
  block: BlockTypeProps;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <CardStyles className={isActive ? "active" : ""}>
      <CardActionArea onClick={onClick} sx={{ height: "100%", width: "100%" }}>
        <CardContent
          sx={{
            padding: 0,
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            flexGrow={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={0.85}
            py={1.5}
            className="card-content"
          >
            <CardMedia component="img" image={block?.image} />
          </Box>
          <Typography
            className="card-content"
            flexGrow={0}
            height="52px"
            width="100%"
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            component="div"
            px={1.5}
            sx={{ backgroundColor: "background.paper" }}
          >
            {block?.label}
          </Typography>
        </CardContent>
      </CardActionArea>
    </CardStyles>
  );
};

export const StarterBlocksDialogue: React.FC<StarterBlocksDialogueProps> = ({
  onClose,
}) => {
  const searchRef = useRef<HTMLDivElement>();
  const [filteredBlockTypes, setFilteredBlockTypes] =
    useState<BlockTypeProps[]>(BLOCK_TYPES);
  const [selectedBlockType, setSelectedBlockType] = useState(null);
  const [activeStep, setActiveStep] = useState<"selection" | "form">(
    "selection"
  );
  const [search, setSearch] = useState("");

  function handleBlockSelect(blockType: any) {
    setSelectedBlockType(blockType);
  }

  function handleSearchRetry() {
    setSearch("");
    searchRef.current?.focus();
  }

  const handleOpenForm = useCallback(() => {
    if (!!selectedBlockType) {
      setActiveStep("form");
    }
  }, [selectedBlockType]);

  useEffect(() => {
    if (!search) return setFilteredBlockTypes(BLOCK_TYPES);
    const filtered = BLOCK_TYPES.filter((block) => {
      const searchString = `${block.label.toLowerCase()}`;

      return searchString.includes(search.toLowerCase());
    });
    setFilteredBlockTypes(filtered);
  }, [search, BLOCK_TYPES]);
  return (
    <>
      {activeStep === "selection" ? (
        <>
          <DialogTitle component="div">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box width={520}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                  Select a Block Type
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start with a blank block or select from our selection of pre
                  designed blocks
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <PlayCircleOutlineRoundedIcon color="info" />{" "}
                  <Link variant="body2" href="#" underline="always">
                    Learn Blocks basics with a tutorial
                  </Link>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => onClose()}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent
            sx={{ pt: 2.5, backgroundColor: "grey.50", minHeight: "650px" }}
            dividers
          >
            <Box display="flex" flexDirection="column" rowGap={2}>
              <Box sx={{ flexGrow: 0 }}>
                <TextField
                  data-cy="FieldListFilter"
                  size="small"
                  placeholder="Search Fields"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  sx={{ width: "60%" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  inputRef={searchRef}
                />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Grid
                  container
                  spacing={{ xs: 2, md: 2, lg: 2 }}
                  columns={{ xs: 4, sm: 8, md: 12 }}
                >
                  {!filteredBlockTypes?.length ? (
                    <Box
                      data-cy="no-results-page"
                      width="100%"
                      p={10}
                      display="grid"
                      sx={{ placeContent: "center", minHeight: "500px" }}
                    >
                      <NoResults
                        type="search"
                        onButtonClick={handleSearchRetry}
                        searchTerm={search}
                        sx={{
                          "& img": { height: "109px", width: "109px" },
                        }}
                      />
                    </Box>
                  ) : (
                    filteredBlockTypes?.map((block, index) => (
                      <Grid
                        key={block?.name}
                        item
                        xs={2}
                        sm={4}
                        md={4}
                        sx={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                        }}
                      >
                        <BlockItem
                          block={block}
                          isActive={selectedBlockType?.name === block?.name}
                          onClick={() => handleBlockSelect(block)}
                        />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ pt: 2.5 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenForm}
              disabled={!selectedBlockType}
              data-cy="select-block-type-next-button"
            >
              Next
            </Button>
          </DialogActions>
        </>
      ) : activeStep === "form" ? (
        <StarterBlockForm
          block={selectedBlockType}
          onClose={onClose}
          setActiveStep={setActiveStep}
        />
      ) : null}
    </>
  );
};
