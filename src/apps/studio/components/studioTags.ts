// Tags that ARE a text element: the ones the Inspector lets you swap between,
// and the ones that own the "T" icon in the Layers tree.
//
// Shared because both rules have to agree on the same set. If a tag is a text
// element, the Tag selector must offer it AND its row must carry the T — a tag
// that appeared in one list but not the other would render a heading that can't
// say it's a heading, or vice versa.
export const TEXT_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
] as const;

// Stand-in tag for a run of text with no text element around it — the "hello"
// in `<div>hello</div>`. The Layers tree gives that text a placeholder row so it
// reads exactly like an <h1> does (a text element carrying the T, with the value
// on the row beneath it), except the tag it reports is "none".
//
// It is deliberately NOT a member of TEXT_TAGS: those are real tags the Tag
// selector can swap between, and turning "no tag" into an <h1> is a different
// operation — it has to WRAP the text in a new element, which the patch layer
// (everything addresses elements by data-layout-id) can't express yet. So the
// placeholder is presentational for now and its Tag selector is read-only.
export const NO_TAG = "__noTag__";

// "Is this a text element?" — true for the real text tags and for the
// placeholder, since it stands in for exactly that. This is what the Layers tree
// asks to decide who owns the T.
export const isTextTag = (tag?: string | null): boolean =>
  !!tag && (tag === NO_TAG || (TEXT_TAGS as readonly string[]).includes(tag));
