import Cocoa

let fileManager = FileManager.default
let currentDirectory = fileManager.currentDirectoryPath
let inputPath = "assets/images/logo.png"
let outputPath = "assets/images/app-store-icon.png"
let targetSize = NSSize(width: 1024, height: 1024)

// Check if input exists
if !fileManager.fileExists(atPath: inputPath) {
    print("Error: Input file not found at \(inputPath)")
    exit(1)
}

guard let image = NSImage(contentsOfFile: inputPath) else { 
    print("Error: Could not load image")
    exit(1) 
}

let newImage = NSImage(size: targetSize)
newImage.lockFocus()

// Fill background with white
NSColor.white.set()
NSRect(origin: .zero, size: targetSize).fill()

// Calculate aspect ratio scaling
let widthRatio = targetSize.width / image.size.width
let heightRatio = targetSize.height / image.size.height
let scale = min(widthRatio, heightRatio)

let scaledWidth = image.size.width * scale
let scaledHeight = image.size.height * scale

// Center the image
let x = (targetSize.width - scaledWidth) / 2
let y = (targetSize.height - scaledHeight) / 2
let destRect = NSRect(x: x, y: y, width: scaledWidth, height: scaledHeight)

// Draw image
image.draw(in: destRect, from: .zero, operation: .sourceOver, fraction: 1.0)

newImage.unlockFocus()

// Save as PNG without alpha (although PNG supports it, we flattened it)
// To ensure no alpha channel metadata if possible, but standard PNG is fine as long as pixels are opaque.
// App Store accepts PNG with no transparency. Since we filled with white, it's opaque.
if let tiffData = newImage.tiffRepresentation,
   let bitmap = NSBitmapImageRep(data: tiffData),
   let pngData = bitmap.representation(using: .png, properties: [:]) { // .jpeg is not allowed for icons usually, PNG is better
    do {
        try pngData.write(to: URL(fileURLWithPath: outputPath))
        print("Success: Image saved to \(outputPath)")
    } catch {
        print("Error saving image: \(error)")
        exit(1)
    }
} else {
    print("Error processing image")
    exit(1)
}
