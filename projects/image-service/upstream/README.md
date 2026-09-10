# Image Service

A powerful, terminal-based image processing service built with Node.js and TypeScript. Process images with simple commands - crop, watermark, resize, compress, and apply various effects.

## Features

- **Crop** - Crop images to fixed aspect ratios (1:1, 4:3, 16:9, etc.)
- **Watermark** - Add watermarks with customizable opacity, position, and scale
- **Resize** - Resize images with multiple fit modes
- **Rotate** - Rotate images by any angle
- **Convert** - Convert between formats (JPEG, PNG, WebP, AVIF, TIFF, GIF)
- **Compress** - Optimize images with quality control
- **Thumbnail** - Generate square thumbnails
- **Border** - Add colored borders
- **Effects** - Blur, sharpen, grayscale, tint, negative, normalize, flip

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

## Usage

All commands follow the pattern:
```bash
npx ts-node src/index.ts <command> <input> [options]
# or after building:
node dist/index.js <command> <input> [options]
# or after linking:
imgserv <command> <input> [options]
```

### Commands

#### Crop
Crop an image to a fixed aspect ratio.

```bash
imgserv crop image.jpg -r 16:9
imgserv crop image.jpg -r 1:1 -w 500 -h 500
imgserv crop image.jpg -r 4:3 -g attention
```

Options:
- `-r, --ratio` - Aspect ratio: 1:1, 4:3, 16:9, 3:2, 2:3, 9:16, 3:4 (required)
- `-w, --width` - Final width after crop
- `-h, --height` - Final height after crop
- `-g, --gravity` - Crop gravity: north, south, east, west, center, entropy, attention
- `-o, --output` - Custom output path

#### Watermark
Add a watermark/logo to an image with opacity control.

```bash
imgserv watermark image.jpg -w logo.png
imgserv watermark image.jpg -w logo.png -p 0.5 -pos center
imgserv watermark image.jpg -w logo.png -p 0.3 -s 0.15 -m 30
```

Options:
- `-w, --watermark` - Watermark image path (required)
- `-p, --opacity` - Opacity 0.0-1.0 (default: 0.5)
- `-pos, --position` - Position: top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right (default: bottom-right)
- `-s, --scale` - Scale relative to image 0.0-1.0 (default: 0.2)
- `-m, --margin` - Margin from edge in pixels (default: 20)
- `-o, --output` - Custom output path

#### Resize
Resize an image to specified dimensions.

```bash
imgserv resize image.jpg -w 800
imgserv resize image.jpg -h 600
imgserv resize image.jpg -w 800 -h 600 -f cover
```

Options:
- `-w, --width` - Target width in pixels
- `-h, --height` - Target height in pixels
- `-f, --fit` - Fit mode: cover, contain, fill, inside, outside (default: inside)
- `-b, --background` - Background color for contain mode
- `-o, --output` - Custom output path

#### Rotate
Rotate an image by a specified angle.

```bash
imgserv rotate image.jpg -a 90
imgserv rotate image.jpg -a 45 -b white
```

Options:
- `-a, --angle` - Rotation angle in degrees (required)
- `-b, --background` - Background color for empty areas (default: transparent)
- `-o, --output` - Custom output path

#### Convert
Convert an image to a different format.

```bash
imgserv convert image.jpg -f webp
imgserv convert image.png -f jpeg -q 90
```

Options:
- `-f, --format` - Output format: jpeg, png, webp, avif, tiff, gif (required)
- `-q, --quality` - Quality 1-100 (default: 85)
- `-o, --output` - Custom output path

#### Compress
Compress an image to reduce file size.

```bash
imgserv compress image.jpg
imgserv compress image.jpg -q 60
imgserv compress image.png -f webp -q 75
```

Options:
- `-q, --quality` - Compression quality 1-100 (default: 70)
- `-f, --format` - Output format: jpeg, png, webp, avif
- `-o, --output` - Custom output path

#### Thumbnail
Create a square thumbnail from an image.

```bash
imgserv thumbnail image.jpg
imgserv thumbnail image.jpg -s 200
```

Options:
- `-s, --size` - Thumbnail size in pixels (default: 150)
- `-o, --output` - Custom output path

#### Border
Add a border to an image.

```bash
imgserv border image.jpg -w 10
imgserv border image.jpg -w 20 -c "#ff0000"
```

Options:
- `-w, --width` - Border width in pixels (required)
- `-c, --color` - Border color (default: black)
- `-o, --output` - Custom output path

#### Info
Display image metadata.

```bash
imgserv info image.jpg
```

#### Effects

**Flip**
```bash
imgserv flip image.jpg -d horizontal
imgserv flip image.jpg -d vertical
imgserv flip image.jpg -d both
```

**Grayscale**
```bash
imgserv grayscale image.jpg
```

**Blur**
```bash
imgserv blur image.jpg -s 5
```

**Sharpen**
```bash
imgserv sharpen image.jpg -s 2
```

**Tint**
```bash
imgserv tint image.jpg -c "#ff6600"
imgserv tint image.jpg -c blue
```

**Negative/Invert**
```bash
imgserv negative image.jpg
```

**Normalize**
```bash
imgserv normalize image.jpg
```

## Output

All processed images are saved to the `./output` folder by default. Use the `-o, --output` option to specify a custom output path.

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development
- **Sharp** - High-performance image processing
- **Commander.js** - CLI framework
- **Chalk** - Terminal styling
- **Ora** - Elegant terminal spinners

## Project Structure

```
image-service/
├── src/
│   ├── commands/       # CLI command implementations
│   ├── services/       # Core image processing logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper functions and utilities
│   └── index.ts        # Main entry point
├── output/             # Default output directory
├── assets/             # Sample assets (watermarks, etc.)
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
