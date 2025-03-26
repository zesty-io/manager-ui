import { Box, Stack, Typography } from "@mui/material";

const QUOTES = [
  {
    quote: "Content is king.",
    quotee: "Bill Gates",
  },
  {
    quote:
      "Marketing is no longer about the stuff that you make, but about the stories you tell.",
    quotee: "Seth Godin",
  },
  {
    quote: "Your brand is a story unfolding across all customer touchpoints.",
    quotee: "Jonah Sachs",
  },
  {
    quote: "The best marketing doesn't feel like marketing.",
    quotee: "Tom Fishburne",
  },
  {
    quote: "People don't buy what you do; they buy why you do it.",
    quotee: "Simon Sinek",
  },
  {
    quote:
      "If you can't explain it simply, you don't understand it well enough.",
    quotee: "Albert Einstein",
  },
  {
    quote: "The most powerful element in advertising is the truth.",
    quotee: "Bill Bernbach",
  },
  {
    quote:
      "A brand is no longer what we tell the consumer it is—it is what consumers tell each other it is.",
    quotee: "Scott Cook",
  },
  {
    quote: "Communication works for those who work at it.",
    quotee: "John Powell",
  },
  {
    quote:
      "The single biggest problem in communication is the illusion that it has taken place.",
    quotee: "George Bernard Shaw",
  },
  {
    quote: "The art of communication is the language of leadership.",
    quotee: "James Humes",
  },
  {
    quote:
      "Engage, enlighten, encourage, and especially…just be yourself! Social media is a community effort; everyone is an asset.",
    quotee: "Susan Cooper",
  },
  {
    quote:
      "The most powerful person in the world is the storyteller. The storyteller sets the vision, values, and agenda of an entire generation that is to come.",
    quotee: "Steve Jobs",
  },
  {
    quote:
      "Your brand is what people say about you when you're not in the room.",
    quotee: "Jeff Bezos",
  },
  {
    quote: "Great stories happen to those who can tell them.",
    quotee: "Ira Glass",
  },
  {
    quote: "No matter what you do, your job is to tell a story.",
    quotee: "Gary Vaynerchuk",
  },
] as const;
const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

export const LoadingQuote = () => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
      textAlign="center"
    >
      <Box
        component="img"
        src="https://zestyio.media.zestyio.com/zesty-logo-only-pulsate.svg"
        loading="lazy"
        sx={{
          width: 100,
          height: 100,
          mb: 4,
        }}
      />
      <Typography variant="h3" sx={{ mb: 1.5, maxWidth: 640 }}>
        "{randomQuote.quote}"
      </Typography>
      <Typography variant="h5">— {randomQuote.quotee}</Typography>
    </Stack>
  );
};
