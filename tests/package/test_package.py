import importlib.util
from pathlib import Path
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("package", ROOT / "scripts/package.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PackageContractTest(unittest.TestCase):
    def fixture(self, root):
        for name in module.FILES:
            (root / name).write_text("canonical")
        for name in module.DIRECTORIES:
            (root / name).mkdir()
            (root / name / "fixture.txt").write_text(name)
        (root / "dist/.vite").mkdir()
        (root / "dist/.vite/manifest.json").write_text("{}")
        (root / "knokspack").mkdir()
        (root / "knokspack/wp-site-suite.php").write_text("STALE AND UNSAFE")

    def test_canonical_source_only_and_preserve_unrelated_outputs(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.fixture(root)
            (root / "build").mkdir()
            (root / "build/keep.txt").write_text("preserve")
            result = module.package(root)
            with zipfile.ZipFile(result) as archive:
                self.assertEqual(archive.read("knokspack/wp-site-suite.php"), b"canonical")
                self.assertTrue(all(name.startswith("knokspack/") and ".." not in name for name in archive.namelist()))
                self.assertNotIn("knokspack/knokspack/wp-site-suite.php", archive.namelist())
            self.assertEqual((root / "build/keep.txt").read_text(), "preserve")

    def test_missing_manifest_does_not_replace_existing_archive(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.fixture(root)
            (root / "build").mkdir()
            (root / "build/knokspack.zip").write_bytes(b"previous")
            (root / "dist/.vite/manifest.json").unlink()
            with self.assertRaises(ValueError):
                module.package(root)
            self.assertEqual((root / "build/knokspack.zip").read_bytes(), b"previous")

    def test_loaded_module_contract(self):
        # Static registration contract; WordPress activation is a separate staging gate.
        import re
        source = (ROOT / "wp-site-suite.php").read_text()
        body = source.split("function knokspack_modules()", 1)[1].split("function knokspack_load_modules", 1)[0]
        names = re.findall(r"^        '([^']+)',", body, re.M)
        self.assertEqual(names, ["security", "performance", "backup", "stats", "marketing", "search", "blocks", "design", "admin/stats-admin"])
        for name in names:
            self.assertGreater((ROOT / "modules" / (name + ".php")).stat().st_size, 0)
        self.assertIn("restore_disabled", (ROOT / "modules/backup.php").read_text())


if __name__ == "__main__":
    unittest.main()
