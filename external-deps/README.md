# Prerequisites

- 7zip extra: http://www.7-zip.org/download.html (current: http://www.7-zip.org/a/7z920_extra.7z)
- ResEdit: http://www.resedit.net
- Microsoft Windows SDK 7.0: https://www.microsoft.com/en-us/download/details.aspx?id=3138

# Instructions

These steps should not be required to be performed again, it's just a reference of what was done. The source of this procedure is: http://www.excelsiorjet.com/kb/35/howto-create-a-single-exe-from-your-java-application

- Copy 7zS.sfx to the external-deps directory
- Rename 7zS.sfx to 7zS.exe (ResEdit will not find the file otherwise)
- Click on "File/Add a resource.../Manifest". Accept the default XML.
- Click on "File/Add a resource.../Icon". Choose Rise Vision's icon.
- Remove the default icon.
- Modify the copyright strings in "Version Information"
- Save and rename 7zS.exe back to 7zS.sfx
