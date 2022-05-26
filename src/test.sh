#!/usr/bin/env bash
COMBY_M="$(cat <<"MATCH"
<Url:[props]>:[text]</Url>
MATCH
)"
COMBY_R="$(cat <<"REWRITE"
<Link
    underline='none'
    color='secondary'
    :[props]
>
    :[text]
</Link>
REWRITE
)"
# Install comby with `bash <(curl -sL get.comby.dev)` or see github.com/comby-tools/comby && \
comby "$COMBY_M" "$COMBY_R"   -stats -match-newline-at-toplevel -i

