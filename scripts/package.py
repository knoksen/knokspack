"""Build an installable ZIP from the repository root, never the legacy nested tree."""
from pathlib import Path
import os
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
FILES = ("wp-site-suite.php", "readme.txt", "license.txt")
DIRECTORIES = ("includes", "modules", "templates", "assets", "dist")


def package(root=ROOT):
    root = Path(root).resolve()
    output = root / "build"
    if output.is_symlink():
        raise ValueError("Build directory must not be a symlink")
    output.mkdir(exist_ok=True)
    sources = [root / name for name in FILES]
    for name in DIRECTORIES:
        directory = root / name
        if directory.is_symlink() or not directory.is_dir():
            raise ValueError(f"Missing or linked package source: {name}")
        for path in sorted(directory.rglob("*")):
            if path.is_symlink():
                raise ValueError(f"Linked package source: {path}")
            if path.is_file() and not (path.suffix == ".php" and path.stat().st_size == 0):
                sources.append(path)
    if not (root / "dist/.vite/manifest.json").is_file():
        raise ValueError("Build manifest missing")
    handle, temporary = tempfile.mkstemp(prefix="knokspack-", suffix=".zip", dir=output)
    os.close(handle)
    try:
        with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED) as archive:
            for path in sources:
                if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(root):
                    raise ValueError(f"Unsafe package source: {path}")
                archive.write(path, "knokspack/" + path.relative_to(root).as_posix())
        with zipfile.ZipFile(temporary) as archive:
            if archive.testzip() is not None:
                raise ValueError("ZIP integrity check failed")
            for path in sources:
                name = "knokspack/" + path.relative_to(root).as_posix()
                if archive.read(name) != path.read_bytes():
                    raise ValueError(f"Archive differs from canonical source: {name}")
        destination = output / "knokspack.zip"
        os.replace(temporary, destination)
        print(f"Validated {len(sources)} canonical source files: {destination}")
        return destination
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


if __name__ == "__main__":
    subprocess.run(["npm.cmd" if os.name == "nt" else "npm", "run", "build"], cwd=ROOT, check=True)
    package()
