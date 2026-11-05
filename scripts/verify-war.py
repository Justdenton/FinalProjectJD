"""Check the executable WAR without connecting to a database or starting a server."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from zipfile import ZipFile


class FrontendAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.base = None
        self.assets = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "base":
            self.base = attrs.get("href")
        if tag == "script" and attrs.get("src"):
            self.assets.append(attrs["src"])
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.assets.append(attrs["href"])


def main():
    root = Path(__file__).resolve().parents[1]
    war_path = root / "NeighborNet/build/libs/NeighborNet.war"
    prefix = "WEB-INF/classes/static/"
    with ZipFile(war_path) as war:
        manifest = war.read("META-INF/MANIFEST.MF").decode()
        if "Main-Class: org.springframework.boot.loader.launch.WarLauncher" not in manifest:
            raise SystemExit("WAR is not executable with the Spring Boot launcher")
        page = FrontendAssets()
        page.feed(war.read(prefix + "index.html").decode())
        if page.base != "/NeighborNet/":
            raise SystemExit(f"Incorrect frontend base path: {page.base!r}")
        if not page.assets:
            raise SystemExit("No frontend scripts or styles were found")
        required = {"images/Gemini_Generated_Image_pins_on_map_neighborhood.jpeg"}
        for asset in page.assets:
            url = urlsplit(asset)
            if url.scheme or url.netloc or url.path.startswith("/"):
                raise SystemExit(f"Expected a packaged relative asset: {asset}")
            required.add(url.path)
        missing = sorted(path for path in required if prefix + path not in war.namelist())
        if missing:
            raise SystemExit(f"WAR is missing frontend assets: {missing}")
    print(f"Verified executable WAR, /NeighborNet/ base, and {len(required)} frontend assets")


if __name__ == "__main__":
    main()
