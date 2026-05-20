def test_phases_grouped_by_h2(page_loader):
    page, md = page_loader
    md.write_text("# Title\n\n## Phase A\n\nA body\n\n## Phase B\n\nB body\n")
    page.reload()
    page.wait_for_selector(".phase")
    assert page.locator(".phase").count() == 2
    assert "Phase A" in page.locator(".phase >> nth=0 >> h2").inner_text()


def test_sidebar_lists_phases(page_loader):
    page, md = page_loader
    md.write_text("# T\n\n## P1\n\nx\n\n## P2\n\ny\n")
    page.reload()
    page.wait_for_selector(".nav-item")
    items = page.locator(".nav-item").all_text_contents()
    assert "P1" in "".join(items)
    assert "P2" in "".join(items)


def test_doc_mode_no_progress(page_loader):
    page, md = page_loader
    md.write_text("# Spec\n\n## Section A\n\nProse only\n")
    page.reload()
    page.wait_for_selector(".phase")
    assert page.locator("body.plan-mode").count() == 0
    assert page.locator("body.doc-mode").count() == 1
    assert page.locator("#progress-bar").count() == 0


def test_plan_mode_with_checkboxes(page_loader):
    page, md = page_loader
    md.write_text("# Plan\n\n## P1\n\n- [ ] do thing\n")
    page.reload()
    page.wait_for_selector(".phase")
    assert page.locator("body.plan-mode").count() == 1


def test_phase_badges(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n- [x] x\n- [x] y\n\n## B\n\n- [x] x\n- [ ] y\n\n## C\n\n- [ ] x\n"
    )
    page.reload()
    page.wait_for_selector(".badge")
    assert page.locator(".badge.done").count() == 1
    assert page.locator(".badge.wip").count() == 1
    assert page.locator(".badge.todo").count() == 1


def test_checkbox_toggle_saves(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\n- [ ] task one\n")
    page.reload()
    page.wait_for_selector("input.task-cb")
    page.locator("input.task-cb").first.click()
    import time as _t
    deadline = _t.time() + 2
    while _t.time() < deadline and "[x]" not in md.read_text():
        _t.sleep(0.1)
    assert "[x]" in md.read_text()


def test_edit_phase_body_saves(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\nold body\n")
    page.reload()
    page.wait_for_selector(".phase-body")
    page.locator(".phase-body").first.click()
    page.wait_for_selector("textarea.editor")
    page.locator("textarea.editor").fill("new body content\n")
    page.locator("textarea.editor").blur()
    import time as _t
    deadline = _t.time() + 2
    while _t.time() < deadline and "new body content" not in md.read_text():
        _t.sleep(0.1)
    assert "new body content" in md.read_text()


def test_conflict_modal_appears(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\nv1\n")
    page.reload()
    page.wait_for_selector(".phase-body")
    md.write_text("# P\n\n## A\n\nv2-external\n")
    page.locator(".phase-body").first.click()
    page.locator("textarea.editor").fill("v3 from browser\n")
    page.locator("textarea.editor").blur()
    page.wait_for_selector("#conflict-modal:not([hidden])", timeout=3000)


def test_external_edit_propagates(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\nbefore external\n")
    page.reload()
    page.wait_for_selector(".phase-body")
    md.write_text("# P\n\n## A\n\nafter external\n")
    page.wait_for_function(
        "() => document.querySelector('.phase-body').textContent.includes('after external')",
        timeout=4000,
    )


def test_callouts_styled(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n> [!NOTE]\n> info text\n\n"
        "> [!WARNING]\n> watch out\n"
    )
    page.reload()
    page.wait_for_selector(".callout.note")
    assert page.locator(".callout.note").count() == 1
    assert page.locator(".callout.warning").count() == 1


def test_code_copy_button(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\n```python\nprint('hi')\n```\n")
    page.reload()
    page.wait_for_selector("pre .copy-btn")


def test_tables_and_anchors(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## Section\n\n"
        "| col | col2 |\n|---|---|\n| a | b |\n"
    )
    page.reload()
    page.wait_for_selector("table")
    assert page.locator("table th").count() == 2
    h2_id = page.locator(".phase h2").first.get_attribute("id")
    assert h2_id is not None


def test_doc_mode_nested_toc(page_loader):
    page, md = page_loader
    md.write_text(
        "# Doc\n\n## A\n\n### A.1\n### A.2\n\n## B\n\n### B.1\n"
    )
    page.reload()
    page.wait_for_selector(".nav-item")
    sub = page.locator(".nav-sub").all_text_contents()
    assert "A.1" in "".join(sub)
    assert "B.1" in "".join(sub)


def test_mermaid_renders(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\n```mermaid\ngraph TD; A-->B\n```\n")
    page.reload()
    page.wait_for_selector("svg[id^='mermaid-']", timeout=4000)


def test_kanban_toggle(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\n- [x] done one\n- [ ] todo one\n")
    page.reload()
    page.wait_for_selector(".view-toggle")
    page.locator(".view-toggle button[data-view='kanban']").click()
    page.wait_for_selector(".kanban-board")
    assert page.locator(".kanban-card").count() == 2


def test_dark_mode_persists(page_loader):
    page, md = page_loader
    page.locator("#theme-toggle").click()
    assert page.locator("body.dark").count() == 1
    page.reload()
    page.wait_for_load_state()
    assert page.locator("body.dark").count() == 1


def test_offline_edit_recovery(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\nbefore\n")
    page.reload()
    page.wait_for_selector(".phase-body")
    page.route("**/plan**", lambda r: r.abort())
    page.locator(".phase-body").first.click()
    page.locator("textarea.editor").fill("draft-unsaved\n")
    page.locator("textarea.editor").blur()
    page.wait_for_function(
        "() => localStorage.getItem('plan-explorer:draft:' + location.pathname) !== null",
        timeout=2000
    )
    page.unroute("**/plan**")
    stored = page.evaluate(
        "() => localStorage.getItem('plan-explorer:draft:' + location.pathname) || ''"
    )
    assert "draft-unsaved" in stored


def test_syntax_highlight_python(page_loader):
    page, md = page_loader
    md.write_text("# P\n\n## A\n\n```python\ndef hi(): pass\n```\n")
    page.reload()
    page.wait_for_selector(".language-python .token.keyword")


def test_tree_block_collapsible(page_loader):
    page, md = page_loader
    md.write_text(
        "# P\n\n## A\n\n```tree\n"
        "root/\n├── a.py\n└── sub/\n    └── b.md\n"
        "```\n"
    )
    page.reload()
    page.wait_for_selector(".tree-dir")
    assert page.locator(".tree-dir").count() >= 2  # root/ and sub/
    assert page.locator(".tree-file").count() == 2  # a.py and b.md
    page.locator(".tree-dir .tree-toggle").nth(1).click()
    expanded = page.locator(".tree-dir").nth(1).get_attribute("aria-expanded")
    assert expanded == "false"
