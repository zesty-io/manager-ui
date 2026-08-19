"""Unit tests for publish_qa_screenshots.

No CI job runs anything under `ci/scripts/`, so this is a local gate and a record of the
intended behaviour, not an enforced check. Run it with:

    python3 -m unittest discover -s ci/scripts -p 'test_*.py' -v
"""

import contextlib
import io
import tempfile
import unittest
from pathlib import Path

from publish_qa_screenshots import TOKEN, rewrite_report


def names(text: str) -> list[str]:
    """The screenshot filenames TOKEN captures from `text`, in order."""
    return [match.group(2) for match in TOKEN.finditer(text)]


class TokenRegexTest(unittest.TestCase):
    def test_plain_caption(self):
        self.assertEqual(names("![a](SCREENSHOT:a.png)"), ["a.png"])

    def test_caption_containing_a_bracket(self):
        # The real caption from PR #4271, whose two screenshots the old `[^\]]*` dropped:
        # the backticked `[]` describes an empty cookie array and ended the group early.
        caption = ("Cookie state immediately before reload, showing both the "
                   "domain-scoped `[]` cookie and the host-scoped one")
        self.assertEqual(
            names(f"![{caption}](SCREENSHOT:announcement-cookie-before-reload.png)"),
            ["announcement-cookie-before-reload.png"],
        )

    def test_caption_containing_a_data_cy_selector(self):
        # This repo puts data-cy on every interactive element, so QA captions quote them.
        text = '![the [data-cy="save"] button after failure](SCREENSHOT:b.png)'
        self.assertEqual(names(text), ["b.png"])

    def test_two_tokens_on_one_line(self):
        # The lazy `.*?` must not run the first token's `)` together with the second caption.
        self.assertEqual(
            names("![a](SCREENSHOT:a.png) and ![b](SCREENSHOT:b.png)"), ["a.png", "b.png"]
        )

    def test_empty_caption(self):
        self.assertEqual(names("![](SCREENSHOT:c.png)"), ["c.png"])

    def test_caption_cannot_span_a_newline(self):
        # re.DOTALL is deliberately not set, so `.` excludes \n and a stray `![` earlier in
        # the report cannot swallow the lines up to the next real token.
        self.assertEqual(names("![stray bracket\nprose\n![a](SCREENSHOT:a.png)"), ["a.png"])


class RewriteReportTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.artifacts = Path(tmp.name) / "qa-artifacts"
        self.artifacts.mkdir()
        self.report = Path(tmp.name) / "negative-qa-comment.md"

    def rewrite(self, body: str, urls: dict[str, str] = None) -> tuple[str, str]:
        """Runs rewrite_report over `body`; returns the rewritten report and its stdout."""
        self.report.write_text(body, encoding="utf-8")
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            rewrite_report(self.report, urls or {}, self.artifacts)
        return self.report.read_text(encoding="utf-8"), out.getvalue()

    def test_token_with_a_bracketed_caption_is_linked(self):
        caption = "Cookie state before reload, showing the domain-scoped `[]` cookie"
        body, out = self.rewrite(
            f"![{caption}](SCREENSHOT:a.png)", {"a.png": "https://example.test/a.png"}
        )
        self.assertEqual(body, f"![{caption}](https://example.test/a.png)")
        self.assertIn("1 linked, 0 artifact-only, 0 never captured", out)
        self.assertNotIn("::error::", out)

    def test_unparsed_token_is_reported_as_an_error(self):
        # A token the regex cannot reach leaves every counter at zero, which reads exactly
        # like a report that cited no screenshots. The leftover scan exists to break that tie.
        body, out = self.rewrite("![caption\nspanning lines](SCREENSHOT:a.png)")
        self.assertIn("SCREENSHOT:a.png", body)
        self.assertIn("0 linked, 0 artifact-only, 0 never captured", out)
        self.assertIn("::error::1 screenshot token(s) survived rewriting", out)
        self.assertIn("SCREENSHOT:a.png", out.split("::error::")[1])

    def test_never_captured_token_warns_without_a_leftover_error(self):
        # The substituted placeholder must not itself trip the leftover scan.
        body, out = self.rewrite("![a](SCREENSHOT:a.png)")
        self.assertNotIn("SCREENSHOT:", body)
        self.assertIn("never captured: a.png", out)
        self.assertNotIn("::error::", out)

    def test_report_citing_no_screenshots_is_untouched(self):
        body, out = self.rewrite("No findings.\n")
        self.assertEqual(body, "No findings.\n")
        self.assertNotIn("::error::", out)


if __name__ == "__main__":
    unittest.main()
