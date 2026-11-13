// Original Chyuan Dar motion graphics, local logo and mathematically generated sound.
// swift -module-cache-path /tmp/cdweb-video-work/module-cache tools/render-tax-refund-video.swift <workspace> <work-dir> [--stills]
import Foundation
import AppKit
import AVFoundation
import CoreVideo

struct Scene: Decodable {
    let seconds: Double
    let eyebrow: String
    let title: [String]
    let subtitle: [String]
    let kind: String
}
let root = URL(fileURLWithPath: CommandLine.arguments[1])
let work = URL(fileURLWithPath: CommandLine.arguments[2])
let scenes = try JSONDecoder().decode([Scene].self, from: Data(contentsOf: root.appendingPathComponent("tools/japan-tax-refund-video.json")))
let W = 720, H = 900, fps = 24
let navy = NSColor(srgbRed: 22/255, green: 62/255, blue: 115/255, alpha: 1)
let blue = NSColor(srgbRed: 26/255, green: 74/255, blue: 142/255, alpha: 1)
let gold = NSColor(srgbRed: 201/255, green: 169/255, blue: 97/255, alpha: 1)
let pale = NSColor(srgbRed: 232/255, green: 240/255, blue: 250/255, alpha: 1)
let white = NSColor.white
let background = NSColor(srgbRed: 248/255, green: 250/255, blue: 253/255, alpha: 1)
let secondary = NSColor(srgbRed: 75/255, green: 95/255, blue: 121/255, alpha: 1)
let logo = NSImage(contentsOf: root.appendingPathComponent("logo-blue.png"))!
var lengths: [Double] = [], starts: [Double] = []
var duration = 0.0
for (i, scene) in scenes.enumerated() {
    starts.append(duration)
    let length = ceil(scene.seconds * Double(fps)) / Double(fps)
    lengths.append(length); duration += length
    print("Scene \(i+1): \(length)s")
}
func ease(_ v: Double) -> Double { let x = min(1,max(0,v)); return 1-pow(1-x,3) }
func box(_ c: CGContext, _ r: CGRect, _ color: NSColor, _ radius: CGFloat = 0) {
    c.setFillColor(color.cgColor)
    c.addPath(CGPath(roundedRect: r, cornerWidth: radius, cornerHeight: radius, transform: nil)); c.fillPath()
}
func line(_ c: CGContext, _ points: [CGPoint], _ color: NSColor, _ width: CGFloat = 4) {
    guard let first = points.first else { return }
    c.setStrokeColor(color.cgColor); c.setLineWidth(width); c.setLineCap(.round); c.setLineJoin(.round)
    c.beginPath(); c.move(to: first); for p in points.dropFirst() { c.addLine(to: p) }; c.strokePath()
}
func text(_ value: String, _ x: CGFloat, _ y: CGFloat, _ size: CGFloat, _ color: NSColor, _ bold: Bool = false, _ width: CGFloat = 640, _ center: Bool = false) {
    let font = NSFont(name: bold ? "PingFangTC-Semibold" : "PingFangTC-Regular", size: size) ?? NSFont.systemFont(ofSize: size, weight: bold ? .semibold : .regular)
    let paragraph = NSMutableParagraphStyle(); paragraph.alignment = center ? .center : .left
    paragraph.lineBreakMode = .byWordWrapping
    (value as NSString).draw(in: CGRect(x:x,y:y,width:width,height:size*1.5), withAttributes:[.font:font,.foregroundColor:color,.paragraphStyle:paragraph])
}
func ellipse(_ c: CGContext, _ r: CGRect, _ color: NSColor) { c.setFillColor(color.cgColor); c.fillEllipse(in:r) }
func bag(_ c: CGContext, _ x: CGFloat, _ y: CGFloat, _ scale: CGFloat, _ color: NSColor) {
    c.saveGState(); c.translateBy(x:x,y:y); c.scaleBy(x:scale,y:scale)
    box(c,CGRect(x:0,y:38,width:150,height:154),color,16)
    c.setStrokeColor(navy.cgColor); c.setLineWidth(10); c.setLineCap(.round)
    c.move(to:CGPoint(x:40,y:55)); c.addCurve(to:CGPoint(x:110,y:55), control1:CGPoint(x:40,y:-13), control2:CGPoint(x:110,y:-13)); c.strokePath()
    c.restoreGState()
}
func passport(_ c: CGContext, _ x: CGFloat, _ y: CGFloat) {
    box(c,CGRect(x:x,y:y,width:132,height:188),navy,17)
    text("護照",x,y+25,25,gold,true,132,true)
    c.setStrokeColor(gold.cgColor); c.setLineWidth(3); c.strokeEllipse(in:CGRect(x:x+37,y:y+77,width:58,height:58))
    line(c,[CGPoint(x:x+38,y:y+106),CGPoint(x:x+95,y:y+106)],gold,2)
    c.strokeEllipse(in:CGRect(x:x+54,y:y+77,width:24,height:58))
}
func plane(_ c: CGContext, _ x: CGFloat, _ y: CGFloat, _ scale: CGFloat, _ color: NSColor) {
    c.saveGState(); c.translateBy(x:x,y:y); c.scaleBy(x:scale,y:scale)
    c.setFillColor(color.cgColor); c.beginPath(); c.move(to:CGPoint(x:0,y:31)); c.addLines(between:[CGPoint(x:45,y:22),CGPoint(x:64,y:0),CGPoint(x:74,y:0),CGPoint(x:63,y:20),CGPoint(x:96,y:15),CGPoint(x:109,y:19),CGPoint(x:103,y:26),CGPoint(x:58,y:34),CGPoint(x:37,y:61),CGPoint(x:26,y:61),CGPoint(x:37,y:38),CGPoint(x:11,y:43)]); c.closePath(); c.fillPath()
    c.restoreGState()
}
func icon(_ c: CGContext, _ kind: String, _ t: Double) {
    let bob = CGFloat(sin(t*1.5)*4)
    c.saveGState(); c.translateBy(x:0,y:bob)
    if kind == "intro" {
        ellipse(c,CGRect(x:451,y:423,width:112,height:112),NSColor(srgbRed:0.91,green:0.35,blue:0.33,alpha:1))
        c.setFillColor(blue.cgColor); c.beginPath(); c.move(to:CGPoint(x:119,y:624)); c.addLine(to:CGPoint(x:340,y:424)); c.addLine(to:CGPoint(x:582,y:624)); c.closePath(); c.fillPath()
        c.setFillColor(white.cgColor); c.beginPath(); c.move(to:CGPoint(x:340,y:424)); c.addLines(between:[CGPoint(x:281,y:478),CGPoint(x:316,y:467),CGPoint(x:342,y:492),CGPoint(x:368,y:466),CGPoint(x:405,y:478)]); c.closePath(); c.fillPath()
        line(c,[CGPoint(x:124,y:633),CGPoint(x:595,y:633)],gold,5)
        plane(c,149+CGFloat(t.truncatingRemainder(dividingBy:5))*14,432,0.92,navy)
    } else if kind == "shop" {
        bag(c,133,446,1.0,gold)
        bag(c,285,502,0.62,NSColor(srgbRed:0.47,green:0.66,blue:0.86,alpha:1))
        passport(c,428,431)
    } else if kind == "airport" {
        box(c,CGRect(x:153,y:417,width:170,height:221),white,22)
        box(c,CGRect(x:174,y:440,width:128,height:89),blue,9)
        plane(c,194,456,0.78,white)
        box(c,CGRect(x:177,y:558,width:67,height:12),navy,5)
        box(c,CGRect(x:190,y:625,width:97,height:20),navy,6)
        line(c,[CGPoint(x:367,y:530),CGPoint(x:410,y:530)],gold,9)
        line(c,[CGPoint(x:396,y:515),CGPoint(x:412,y:530),CGPoint(x:396,y:545)],gold,7)
        box(c,CGRect(x:461,y:447,width:52,height:40),navy,9)
        box(c,CGRect(x:435,y:476,width:106,height:157),blue,20)
        line(c,[CGPoint(x:467,y:492),CGPoint(x:467,y:614)],pale,3)
        line(c,[CGPoint(x:507,y:492),CGPoint(x:507,y:614)],pale,3)
        ellipse(c,CGRect(x:448,y:630,width:18,height:18),navy); ellipse(c,CGRect(x:511,y:630,width:18,height:18),navy)
    } else if kind == "refund" {
        box(c,CGRect(x:149,y:441,width:346,height:194),navy,25)
        text("REFUND",179,467,30,white,true)
        box(c,CGRect(x:181,y:536,width:48,height:37),gold,7)
        line(c,[CGPoint(x:179,y:601),CGPoint(x:365,y:601)],pale,5)
        for j in 0..<3 { ellipse(c,CGRect(x:484+CGFloat(j*17),y:568-CGFloat(j*28),width:75,height:75),gold) }
        line(c,[CGPoint(x:490,y:435),CGPoint(x:553,y:435),CGPoint(x:553,y:482)],gold,7)
        line(c,[CGPoint(x:537,y:466),CGPoint(x:553,y:484),CGPoint(x:569,y:466)],gold,7)
    } else if kind == "warning" {
        box(c,CGRect(x:233,y:412,width:233,height:240),white,18)
        for j in 0..<3 {
            let y: CGFloat = 448+CGFloat(j*57)
            box(c,CGRect(x:260,y:y,width:28,height:28),j == 2 ? pale : gold,6)
            line(c,[CGPoint(x:310,y:y+13),CGPoint(x:425,y:y+13)],j == 2 ? pale : navy,7)
        }
        ellipse(c,CGRect(x:423,y:535,width:103,height:103),gold)
        text("!",423,543,62,navy,true,103,true)
    } else {
        line(c,[CGPoint(x:220,y:522),CGPoint(x:296,y:586),CGPoint(x:485,y:441)],gold,22)
        text("安心出發",197,596,32,white,true,326,true)
    }
    c.restoreGState()
}
func sceneImage(_ c: CGContext, _ index: Int, _ local: Double, _ alpha: CGFloat = 1) {
    let s = scenes[index], enter = ease(local/0.65)
    c.saveGState(); c.setAlpha(alpha)
    box(c,CGRect(x:0,y:0,width:W,height:H),background)
    let logoSize = logo.size
    logo.draw(in:CGRect(x:44,y:31,width:202,height:202*logoSize.height/logoSize.width),from:.zero,operation:.sourceOver,fraction:1,respectFlipped:true,hints:nil)
    text("旅人提醒",539,41,17,secondary,false,136)
    for i in 0..<6 {
        let x = CGFloat(44+i*107)
        box(c,CGRect(x:x,y:112,width:96,height:4),pale,2)
        let p = i < index ? 1 : i == index ? min(1,local/lengths[index]) : 0
        if p > 0 { box(c,CGRect(x:x,y:112,width:96*p,height:4),gold,2) }
    }
    text(s.eyebrow,44,149,19,secondary,true)
    let titleSize: CGFloat = s.title.contains(where:{$0.count>9}) ? 59 : 66
    for (i,t) in s.title.enumerated() { text(t,44,193+CGFloat(i*83)+CGFloat((1-enter)*16),titleSize,i == 1 ? blue : navy,true) }
    box(c,CGRect(x:44,y:369,width:CGFloat(115*enter),height:5),gold,2)
    box(c,CGRect(x:44,y:400,width:632,height:278),s.kind == "outro" ? navy : pale,28)
    icon(c,s.kind,local)
    for (i,t) in s.subtitle.enumerated() { text(t,44,718+CGFloat(i*44),27,secondary,i == 0) }
    line(c,[CGPoint(x:44,y:829),CGPoint(x:676,y:829)],pale,1)
    text("www.chyuandar.com.tw",44,847,16,navy,true,390)
    text("詮達旅行社",501,847,17,navy,true,175)
    text("資料來源：日本觀光廳・日本海關｜2026.11",44,876,13,secondary)
    c.restoreGState()
}
func render(_ c: CGContext, _ time: Double) {
    c.saveGState(); c.translateBy(x:0,y:CGFloat(H)); c.scaleBy(x:1,y:-1)
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(cgContext:c,flipped:true)
    var index = starts.lastIndex(where:{$0 <= time}) ?? 0
    index = min(index,scenes.count-1)
    let local = time-starts[index]
    if index > 0 && local < 0.32 {
        sceneImage(c,index-1,lengths[index-1])
        sceneImage(c,index,local,CGFloat(ease(local/0.32)))
    } else { sceneImage(c,index,local) }
    NSGraphicsContext.restoreGraphicsState(); c.restoreGState()
}
func still(_ time: Double, _ name: String) throws {
    let c = CGContext(data:nil,width:W,height:H,bitsPerComponent:8,bytesPerRow:W*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
    render(c,time)
    let bitmap=NSBitmapImageRep(cgImage:c.makeImage()!)
    try bitmap.representation(using:.jpeg,properties:[.compressionFactor:0.9])!.write(to:work.appendingPathComponent(name))
}
for i in scenes.indices { try still(starts[i]+1.5,"scene-\(i).jpg") }
try JSONSerialization.data(withJSONObject:["duration":duration,"starts":starts,"lengths":lengths],options:.prettyPrinted).write(to:work.appendingPathComponent("timing.json"))
if CommandLine.arguments.contains("--stills") { exit(0) }

let silentURL=work.appendingPathComponent("silent.mp4")
if FileManager.default.fileExists(atPath:silentURL.path) { try FileManager.default.removeItem(at:silentURL) }
let writer=try AVAssetWriter(outputURL:silentURL,fileType:.mp4)
writer.shouldOptimizeForNetworkUse=true
let settings:[String:Any]=[AVVideoCodecKey:AVVideoCodecType.h264,AVVideoWidthKey:W,AVVideoHeightKey:H,AVVideoCompressionPropertiesKey:[AVVideoAverageBitRateKey:1_100_000,AVVideoMaxKeyFrameIntervalKey:48,AVVideoProfileLevelKey:AVVideoProfileLevelH264MainAutoLevel]]
let input=AVAssetWriterInput(mediaType:.video,outputSettings:settings)
let attributes:[String:Any]=[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32BGRA,kCVPixelBufferWidthKey as String:W,kCVPixelBufferHeightKey as String:H,kCVPixelBufferCGImageCompatibilityKey as String:true,kCVPixelBufferCGBitmapContextCompatibilityKey as String:true]
let adaptor=AVAssetWriterInputPixelBufferAdaptor(assetWriterInput:input,sourcePixelBufferAttributes:attributes)
writer.add(input)
guard writer.startWriting() else { fatalError("\(String(describing:writer.error))") }
writer.startSession(atSourceTime:.zero)
let frames=Int(ceil(duration*Double(fps)))
for f in 0..<frames {
    while !input.isReadyForMoreMediaData {
        if writer.status == .failed { fatalError("\(String(describing:writer.error))") }
        Thread.sleep(forTimeInterval:0.003)
    }
    autoreleasepool {
        var optional:CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(nil,adaptor.pixelBufferPool!,&optional)
        let pixel=optional!
        CVPixelBufferLockBaseAddress(pixel,[])
        let c=CGContext(data:CVPixelBufferGetBaseAddress(pixel),width:W,height:H,bitsPerComponent:8,bytesPerRow:CVPixelBufferGetBytesPerRow(pixel),space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGBitmapInfo.byteOrder32Little.rawValue | CGImageAlphaInfo.premultipliedFirst.rawValue)!
        render(c,Double(f)/Double(fps))
        CVPixelBufferUnlockBaseAddress(pixel,[])
        guard adaptor.append(pixel,withPresentationTime:CMTime(value:Int64(f),timescale:Int32(fps))) else { fatalError("\(String(describing:writer.error))") }
    }
    if f % (fps*6) == 0 { print("Rendered \(f)/\(frames) frames") }
}
input.markAsFinished()
let finished=DispatchSemaphore(value:0)
writer.finishWriting { finished.signal() }; finished.wait()
guard writer.status == .completed else { fatalError("\(String(describing:writer.error))") }

let composition=AVMutableComposition()
let videoAsset=AVURLAsset(url:silentURL)
let videoTrack=composition.addMutableTrack(withMediaType:.video,preferredTrackID:kCMPersistentTrackID_Invalid)!
try videoTrack.insertTimeRange(CMTimeRange(start:.zero,duration:CMTime(seconds:duration,preferredTimescale:600)),of:videoAsset.tracks(withMediaType:.video)[0],at:.zero)
let audioTrack=composition.addMutableTrack(withMediaType:.audio,preferredTrackID:kCMPersistentTrackID_Invalid)!
var captions="WEBVTT\n\n"
func stamp(_ t:Double)->String {
    let ms=Int(t*1000); return String(format:"%02d:%02d:%02d.%03d",ms/3600000,(ms/60000)%60,(ms/1000)%60,ms%1000)
}
let soundtrack=AVURLAsset(url:work.appendingPathComponent("original-sound.wav"))
try audioTrack.insertTimeRange(CMTimeRange(start:.zero,duration:CMTime(seconds:duration,preferredTimescale:600)),of:soundtrack.tracks(withMediaType:.audio)[0],at:.zero)
for i in scenes.indices {
    let words=scenes[i].title.joined(separator:"，") + "。\n" + scenes[i].subtitle.joined(separator:"，") + "。"
    captions += "\(i+1)\n\(stamp(starts[i])) --> \(stamp(starts[i]+lengths[i]))\n\(words)\n\n"
}
let output=root.appendingPathComponent("assets/notices/japan-tax-refund-2026.mp4")
if FileManager.default.fileExists(atPath:output.path) { try FileManager.default.removeItem(at:output) }
let exporter=AVAssetExportSession(asset:composition,presetName:AVAssetExportPresetHighestQuality)!
exporter.outputURL=output; exporter.outputFileType = .mp4; exporter.shouldOptimizeForNetworkUse=true
let exported=DispatchSemaphore(value:0)
exporter.exportAsynchronously { exported.signal() }; exported.wait()
guard exporter.status == .completed else { fatalError("\(String(describing:exporter.error))") }
try captions.write(to:root.appendingPathComponent("assets/notices/japan-tax-refund-2026.vtt"),atomically:true,encoding:.utf8)
let poster=root.appendingPathComponent("assets/notices/japan-tax-refund-2026-video-poster.jpg")
if FileManager.default.fileExists(atPath:poster.path) { try FileManager.default.removeItem(at:poster) }
try FileManager.default.copyItem(at:work.appendingPathComponent("scene-0.jpg"),to:poster)
print("Completed original video: \(duration)s, \(output.path)")
