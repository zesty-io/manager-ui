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


def captions(text: str) -> list[str]:
    """The captions TOKEN captures from `text`, in order."""
    return [match.group(1) for match in TOKEN.finditer(text)]


class TokenRegexTest(unittest.TestCase):
    def test_plain_caption(self):
        self.assertEqual(names("![a](SCREENSHOT:a.png)"), ["a.png"])

    def test_caption_containing_a_bracket(self):
        # The real caption from PR #4271, whose two screenshots this dropped.
        caption = ("Cookie state immediately before reload, showing both the "
                   "domain-scoped `[]` cookie and the host-scoped one")
        self.assertEqual(
            names(f"![{caption}](SCREENSHOT:announcement-cookie-before-reload.png)"),
            ["announcement-cookie-before-reload.png"],
        )

    def test_caption_containing_a_data_cy_selector(self):
        text = '![the [data-cy="save"] button after failure](SCREENSHOT:b.png)'
        self.assertEqual(names(text), ["b.png"])

    def test_two_tokens_on_one_line(self):
        self.assertEqual(
            names("![a](SCREENSHOT:a.png) and ![b](SCREENSHOT:b.png)"), ["a.png", "b.png"]
        )

    def test_empty_caption(self):
        self.assertEqual(names("![](SCREENSHOT:c.png)"), ["c.png"])

    def test_caption_cannot_span_a_newline(self):
        # Assert the caption: `a.png` is captured either way, so checking only the
        # name would pass against re.DOTALL.
        text = "![stray bracket\nprose\n[a](SCREENSHOT:a.png)"
        self.assertEqual(captions(text), [])
        self.assertEqual(names(text), [])

    def test_caption_cannot_swallow_an_earlier_image_on_the_same_line(self):
        text = "![chart](https://x.test/c.png) and ![b](SCREENSHOT:b.png)"
        self.assertEqual(captions(text), ["b"])
        self.assertEqual(names(text), ["b.png"])

    def test_caption_cannot_swallow_an_earlier_image_before_a_link_form_token(self):
        text = "![baseline](https://x.test/base.png) vs [regressed](SCREENSHOT:reg.png)"
        self.assertEqual(names(text), [])

    def test_caption_cannot_start_inside_a_nested_image(self):
        text = "![before ![thumb](t.png) after](SCREENSHOT:a.png)"
        self.assertEqual(names(text), [])


class RewriteReportTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.artifacts = Path(tmp.name) / "qa-artifacts"
        self.artifacts.mkdir()
        self.report = Path(tmp.name) / "negative-qa-comment.md"

    def rewrite(self, body: str, urls: dict[str, str] | None = None) -> tuple[str, str]:
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

    def test_captured_screenshot_without_a_url_points_at_the_run_artifact(self):
        (self.artifacts / "a.png").write_bytes(b"\x89PNG")
        body, out = self.rewrite("![a](SCREENSHOT:a.png)")
        self.assertEqual(
            body, "_evidence: `a.png` — see the `negative-qa-artifacts` run artifact_"
        )
        self.assertIn("0 linked, 1 artifact-only, 0 never captured", out)
        self.assertNotIn("::warning::", out)
        self.assertNotIn("::error::", out)

    def test_text_before_a_token_survives_on_the_artifact_only_path(self):
        (self.artifacts / "b.png").write_bytes(b"\x89PNG")
        body, out = self.rewrite("![chart](https://x.test/c.png) and ![b](SCREENSHOT:b.png)")
        self.assertEqual(
            body,
            "![chart](https://x.test/c.png) and _evidence: `b.png` — see the "
            "`negative-qa-artifacts` run artifact_",
        )
        self.assertIn("0 linked, 1 artifact-only, 0 never captured", out)

    def test_text_before_a_token_survives_on_the_never_captured_path(self):
        body, out = self.rewrite("![chart](https://x.test/c.png) and ![b](SCREENSHOT:b.png)")
        self.assertEqual(
            body,
            "![chart](https://x.test/c.png) and _⚠️ no screenshot was captured "
            "for this finding (`b.png`)_",
        )
        self.assertIn("0 linked, 0 artifact-only, 1 never captured", out)

    def test_link_form_token_leaves_the_preceding_image_alone_and_errors(self):
        body, out = self.rewrite(
            "![baseline](https://x.test/base.png) vs [regressed](SCREENSHOT:reg.png)"
        )
        self.assertIn("![baseline](https://x.test/base.png)", body)
        self.assertIn("0 linked, 0 artifact-only, 0 never captured", out)
        self.assertIn("::error::1 screenshot token(s) survived rewriting", out)

    def test_nested_image_caption_leaves_the_nested_image_alone_and_errors(self):
        (self.artifacts / "a.png").write_bytes(b"\x89PNG")
        body, out = self.rewrite("![before ![thumb](t.png) after](SCREENSHOT:a.png)")
        self.assertIn("![thumb](t.png)", body)
        self.assertIn("0 linked, 0 artifact-only, 0 never captured", out)
        self.assertIn("::error::1 screenshot token(s) survived rewriting", out)

    def test_unparsed_token_is_reported_as_an_error(self):
        # Unclosed `)` is unparseable under every variant of TOKEN, so this pins the
        # scan rather than any one narrowing of the caption group.
        body, out = self.rewrite("![a](SCREENSHOT:a.png")
        self.assertIn("SCREENSHOT:a.png", body)
        self.assertIn("0 linked, 0 artifact-only, 0 never captured", out)
        self.assertIn("::error::1 screenshot token(s) survived rewriting", out)
        self.assertIn("SCREENSHOT:a.png", out.split("::error::")[1])

    def test_repeated_leftover_token_is_counted_once(self):
        _, out = self.rewrite("![a](SCREENSHOT:a.png\n![a](SCREENSHOT:a.png\n")
        self.assertIn("::error::1 screenshot token(s) survived rewriting", out)
        self.assertEqual(out.count("SCREENSHOT:a.png"), 1)

    def test_never_captured_token_warns_without_a_leftover_error(self):
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
