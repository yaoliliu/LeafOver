"""Regression checks for project settings and template-independent titles."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SERVER = Path(__file__).resolve().parents[1] / "tools" / "preview_server.py"


class ProjectSettingsTest(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location("preview_settings_test", SERVER)
        self.server = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.server)
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        available = patch.object(self.server, "compiler_available", return_value=True)
        available.start()
        self.addCleanup(available.stop)
        self.server.ROOT = self.root
        self.server.FIGURES_DIR = self.root / "figures"
        (self.root / "main.tex").write_text(r"\title{Original}")
        (self.root / "article.tex").write_text(r"\title[Short]{A \textbf{new} title}" + "\n" + r"\section{Intro}")

    def test_title_accepts_nested_groups_optional_title_and_no_author(self):
        self.assertEqual(self.server.extract_title(
            "% \\title{Ignored}\n" + r"\title[Short]{A \textbf{nested} title\\with a break}"),
            "A nested title with a break")
        self.assertEqual(self.server.extract_title(r"\title{unfinished"), "")

    def test_outline_follows_included_files_and_opens_their_sources(self):
        (self.root / "intro.tex").write_text("\\section{Introduction}\n\\input{methods}\n")
        (self.root / "methods.tex").write_text("\\subsection{Method}\n\\input{intro}\n")
        (self.root / "main.tex").write_text("\\title{Nested paper}\n\\input{intro}\n")
        outline = self.server.project_metadata()["outline"]
        self.assertEqual([(item["title"], item["file"], item["line"]) for item in outline],
                         [("Introduction", "intro.tex", 1), ("Method", "methods.tex", 1)])

    def test_custom_title_survives_reload_without_modifying_tex(self):
        self.server.save_project_settings({"main_file": "main.tex", "title": "My workspace"})
        self.server._project_settings["title"] = ""
        self.server.load_project_settings()
        self.assertEqual(self.server.project_metadata()["title"], "My workspace")
        self.assertEqual((self.root / "main.tex").read_text(), r"\title{Original}")
        self.server.save_project_settings({"main_file": "main.tex", "title": ""})
        self.assertEqual(self.server.project_metadata()["title"], "Original")

    def test_switch_updates_compilation_pdf_synctex_and_metadata(self):
        with patch.object(self.server.threading, "Thread") as worker:
            result = self.server.save_project_settings({"main_file": "article.tex", "title": ""})
        self.assertTrue(result["main_changed"])
        worker.return_value.start.assert_called_once()
        self.assertEqual(self.server.COMPILE_CMD[-1], "article.tex")
        self.assertEqual(self.server.PDF_PATH, self.root / "article.pdf")
        self.assertEqual(self.server.SYNCTEX_PATH, self.root / "article.synctex.gz")
        data = self.server.project_metadata()
        self.assertEqual(data["title"], "A new title")
        self.assertEqual(data["outline"][0]["title"], "Intro")
        self.assertEqual(json.loads((self.root / ".leafover.json").read_text())["main_file"], "article.tex")

    def test_busy_compile_does_not_persist_or_switch_main_file(self):
        self.server._state["state"] = "compiling"
        with self.assertRaises(RuntimeError):
            self.server.save_project_settings({"main_file": "article.tex", "title": ""})
        self.assertFalse((self.root / ".leafover.json").exists())
        self.assertEqual(self.server.COMPILE_CMD[-1], "main.tex")

    def test_invalid_paths_and_payloads_do_not_write_config(self):
        (self.root / "alias.tex").symlink_to(self.root / "main.tex")
        for name in ("../main.tex", "/tmp/main.tex", "missing.tex", "alias.tex", "-shell-escape.tex"):
            with self.subTest(name=name), self.assertRaises(ValueError):
                self.server.save_project_settings({"main_file": name, "title": ""})
        for data in ([], {"main_file": "main.tex", "title": "x" * 201}):
            with self.assertRaises(ValueError):
                self.server.save_project_settings(data)
        self.assertFalse((self.root / ".leafover.json").exists())


    def test_compiler_selection_changes_latexmk_engine(self):
        for compiler, flag in (("xelatex", "-xelatex"), ("pdflatex", "-pdf"), ("lualatex", "-lualatex")):
            settings = self.server.validate_project_settings({"main_file": "main.tex", "title": "", "compiler": compiler})
            self.server.apply_project_settings(settings)
            self.assertEqual(self.server.COMPILE_CMD[1], flag)
        with self.assertRaises(ValueError):
            self.server.validate_project_settings({"main_file": "main.tex", "compiler": "xelatex; bad"})

    def test_selected_compiler_is_restored_after_restart(self):
        with patch.object(self.server, "compiler_available", return_value=True), \
             patch.object(self.server.threading, "Thread"):
            self.server.save_project_settings({"main_file": "main.tex", "title": "", "compiler": "lualatex"})
        self.server._project_settings["compiler"] = "xelatex"
        self.server.COMPILE_CMD[1] = "-xelatex"
        self.server.load_project_settings()
        self.assertEqual(self.server.COMPILE_CMD[1], "-lualatex")
        self.assertEqual(self.server._project_settings["compiler"], "lualatex")

    def test_missing_compiler_cannot_be_saved(self):
        with patch.object(self.server, "compiler_available", return_value=False):
            with self.assertRaises(ValueError):
                self.server.save_project_settings({"main_file": "main.tex", "compiler": "lualatex"})
        self.assertFalse((self.root / ".leafover.json").exists())

    def test_lightweight_settings_does_not_scan_project_metadata(self):
        with patch.object(self.server, "project_metadata", side_effect=AssertionError("heavy scan")), \
             patch.object(self.server, "discover_source_files", side_effect=AssertionError("file hash scan")):
            data = self.server.settings_metadata()
        self.assertEqual(data["main_files"], ["article.tex", "main.tex"])
        self.assertEqual(len(data["compilers"]), 3)

    def test_install_is_async_and_rejects_parallel_or_unknown_jobs(self):
        with patch.object(self.server, "compiler_available", return_value=False), \
             patch.object(self.server, "compiler_install_commands", return_value=[["installer"]]), \
             patch.object(self.server.threading, "Thread") as worker:
            self.server.start_compiler_install("lualatex")
            worker.return_value.start.assert_called_once()
            self.assertEqual(self.server.compiler_status()["installation"]["state"], "installing")
            with self.assertRaises(RuntimeError):
                self.server.start_compiler_install("xelatex")
        with self.assertRaises(ValueError):
            self.server.start_compiler_install("unknown; command")

    def test_install_worker_checks_result_and_exposes_failure(self):
        from types import SimpleNamespace
        with patch.object(self.server, "compiler_install_commands", return_value=[["installer", "lualatex"]]), \
             patch.object(self.server.subprocess, "run", return_value=SimpleNamespace(returncode=0, stdout="done", stderr="")), \
             patch.object(self.server, "compiler_available", return_value=True):
            self.server._install_compiler_worker("lualatex")
            self.assertEqual(self.server.compiler_status()["installation"]["state"], "ok")
        with patch.object(self.server, "compiler_install_commands", return_value=[["installer"]]), \
             patch.object(self.server.subprocess, "run", return_value=SimpleNamespace(returncode=1, stdout="", stderr="permission denied")):
            self.server._install_compiler_worker("lualatex")
            state = self.server.compiler_status()["installation"]
            self.assertEqual(state["state"], "error")
            self.assertIn("permission denied", state["log"])

    def test_apt_install_uses_fixed_package_names_without_a_shell(self):
        def which(name, **kwargs):
            return {"apt-get": "/usr/bin/apt-get", "tlmgr": "/usr/share/texlive/tlmgr"}.get(name)
        with patch.object(self.server.shutil, "which", side_effect=which), \
             patch.object(self.server.os, "geteuid", return_value=0):
            commands = self.server.compiler_install_commands("lualatex")
        self.assertEqual(commands[-1], ["/usr/bin/apt-get", "install", "-y", "--no-install-recommends", "texlive-luatex", "latexmk"])


if __name__ == "__main__":
    unittest.main()
