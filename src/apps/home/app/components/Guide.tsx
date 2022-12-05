import { Box, Typography, LinearProgress, Button } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useHistory } from "react-router";
import guide1 from "../../../../../public/images/guide1.png";
import guide2 from "../../../../../public/images/guide2.png";
import guide3 from "../../../../../public/images/guide3.png";

interface Props {
  hasEditedHomepage: boolean;
  hasPublishedHomepage: boolean;
  hasCreatedNewModel: boolean;
  modelZUID: string;
  itemZUID: string;
}

const stepContentMap = [
  {
    title: "Edit Your First Content Item",
    description:
      "Start your experience in Zesty by editing the content of your home page.",
    buttonText: "Edit Content",
    goTo: "content",
    image: guide1,
  },
  {
    title: "Publish Your Edits",
    description:
      "Now that you've edited your content, it's time to publish your edits.",
    buttonText: "Publish Edits",
    goTo: "content",
    image: guide2,
  },
  {
    title: "Create a New Content Model",
    description:
      "To create new types of content you need to make a model first whcih defines the structure for your content items. Learn how to now.",
    buttonText: "Create New Model",
    goTo: "schema",
    image: guide3,
  },
];

export const Guide = ({
  hasEditedHomepage,
  hasPublishedHomepage,
  hasCreatedNewModel,
  modelZUID,
  itemZUID,
}: Props) => {
  const tasks = [hasEditedHomepage, hasPublishedHomepage, hasCreatedNewModel];
  const completedTasks = tasks.filter((task) => task)?.length;
  const taskToDisplay = tasks.findIndex((task: boolean) => !task);
  const history = useHistory();

  return (
    <Box
      sx={{
        backgroundColor: "common.white",
        border: (theme) => `1px solid ${theme.palette.border}`,
        borderRadius: "8px",
        py: 2,
        px: 3,
        width: "100%",
      }}
    >
      <Typography variant="h5" fontWeight={600}>
        Get started with Zesty
      </Typography>
      <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
        <Typography variant="h6" color="text.secondary" sx={{ width: 220 }}>
          {completedTasks} of {tasks?.length} tasks complete
        </Typography>
        <LinearProgress
          sx={{ width: "100%" }}
          variant="determinate"
          value={completedTasks * Math.floor(100 / tasks?.length)}
        />
      </Box>
      <Timeline
        sx={{
          mt: 3,
          [`& .MuiTimelineItem-root:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {tasks.map((task, index) => (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot
                variant="outlined"
                sx={{
                  height: 32,
                  width: 32,
                  borderStyle: "dashed",
                  borderColor: "grey.200",
                }}
              >
                {tasks?.[index] ? (
                  <CheckCircleRoundedIcon
                    color="primary"
                    sx={{
                      width: "40px",
                      height: "40px",
                      position: "relative",
                      top: "-10px",
                      left: "-10px",
                    }}
                  />
                ) : null}
              </TimelineDot>
              {index !== tasks.length - 1 ? (
                <TimelineConnector sx={{ backgroundColor: "grey.200" }} />
              ) : null}
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Typography variant="h5" component="span" fontWeight={600}>
                {stepContentMap[index].title}
              </Typography>
              {taskToDisplay === index ? (
                <Box display="flex" justifyContent="space-between" gap={1}>
                  <div>
                    <Typography sx={{ mt: 1.5 }} variant="body1">
                      {stepContentMap[index].description}
                    </Typography>
                    <Button
                      sx={{ mt: 2 }}
                      onClick={() => {
                        if (stepContentMap[index].goTo === "content") {
                          history.push(`/content/${modelZUID}/${itemZUID}`);
                        } else {
                          history.push(`/schema/new?from=guide`);
                        }
                      }}
                      variant="contained"
                    >
                      {stepContentMap[index].buttonText}
                    </Button>
                  </div>
                  <Box sx={{ mt: -4 }}>
                    <img src={stepContentMap[index].image} />
                  </Box>
                </Box>
              ) : null}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};
