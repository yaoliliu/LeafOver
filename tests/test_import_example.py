import importlib.util
import io
import tempfile
import tarfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("fetch_jit", Path(__file__).resolve().parents[1] / "scripts" / "fetch_jit.py")
fetch_jit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(fetch_jit)


class ExampleImportTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.archive = self.root / "source.tar.gz"

    def archive_with(self, name, text):
        with tarfile.open(self.archive, "w:gz") as bundle:
            body = text.encode()
            info = tarfile.TarInfo(name)
            info.size = len(body)
            bundle.addfile(info, io.BytesIO(body))

    def test_import_preserves_source_and_writes_provenance(self):
        text = r"\documentclass{article}\begin{document}Original source\end{document}"
        self.archive_with("main.tex", text)
        entry = fetch_jit.install_source(self.archive, self.root / "example")
        self.assertEqual(entry.read_text(), text)
        self.assertTrue((entry.parent / "SOURCE.json").is_file())
        self.assertTrue((entry.parent / ".leafover.json").is_file())
        with self.assertRaises(ValueError):
            fetch_jit.install_source(self.archive, entry.parent)
        self.assertEqual(entry.read_text(), text)

    def test_rejects_escaping_paths_before_writing(self):
        self.archive_with("../escape.tex", "bad")
        with self.assertRaises(ValueError):
            fetch_jit.install_source(self.archive, self.root / "example")
        self.assertFalse((self.root / "escape.tex").exists())

    def test_rejects_symlinks(self):
        with tarfile.open(self.archive, "w:gz") as bundle:
            info = tarfile.TarInfo("escape")
            info.type = tarfile.SYMTYPE
            info.linkname = "/tmp"
            bundle.addfile(info)
        with self.assertRaises(ValueError):
            fetch_jit.install_source(self.archive, self.root / "example")


if __name__ == "__main__":
    unittest.main()
