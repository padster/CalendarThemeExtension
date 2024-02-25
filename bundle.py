# Create an extension .zip for submission
# Based on the version in manifest.json, will end up in releases/ 

import json
import os
import zipfile

FILES = [ # Files to include in submission to Chrome Web Store
    "background.js",
    "content.js",
    "icon128.png",
    "manifest.json",
    "options.html",
    "options.js",
    "style.css",
]

def get_version() -> str:
    """Extract the 'version' string from manifest.json"""
    version = None
    with open("manifest.json", "r") as f:
        manifest = json.load(f)
        version = manifest.get("version", None)
    return version

def package_release(version: str) -> str:
    """Create a .zip file for the extension"""
    # First ensure all the files exists
    for file in FILES:
        assert os.path.exists(file), f"File {file} does not exist"

    # Create path to the .zip
    output_path = f"releases/CustomCalendarBackground_v{version.replace(".", "_")}.zip"
    if os.path.exists(output_path):
        raise FileExistsError(f"File at {output_path} already exists. Please delete first or bump version.")

    # And finally create the zip itself:
    with zipfile.ZipFile(output_path, "w") as zip_file:
        for file in FILES:
            zip_file.write(file)

    return output_path

if __name__ == "__main__":
    version = get_version()
    assert version is not None, "Could not extract version from manifest.json"
    print (f"Creating extension bundle for version {version}...")

    output_path = package_release(version)
    print (f"Bundle created at {output_path}")
