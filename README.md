# File Upload Server

A simple Express server for **authenticated file uploads**, automatic **image compression** with [Sharp](https://sharp.pixelplumbing.com/), and file deletion.

## Features

- Upload files with `Multer`
- Compress images to 800px width, JPEG 70% quality
- JWT authentication middleware
- Delete uploaded files
- Serve static files from `/uploads`
