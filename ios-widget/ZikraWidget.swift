import WidgetKit
import SwiftUI

// MARK: - Data Models
struct WidgetData: Decodable, Hashable {
    let nextPrayerName: String
    let nextPrayerTime: String
    let prayerTimeLeft: String
    let dailyQuote: String
    let dailyQuoteSource: String
    let location: String
}

// MARK: - Timeline Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), data: fetchSharedData())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)! // Refresh every 15 mins
        
        let data = fetchSharedData()
        let entry = SimpleEntry(date: currentDate, data: data)

        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
        completion(timeline)
    }
    
    private func fetchSharedData() -> WidgetData {
        // Read from App Group
        let userDefaults = UserDefaults(suiteName: "group.com.yusuf.zikraapp")
        if let jsonString = userDefaults?.string(forKey: "widgetData"),
           let jsonData = jsonString.data(using: .utf8) {
            do {
                let data = try JSONDecoder().decode(WidgetData.self, from: jsonData)
                return data
            } catch {
                print("Error decoding widget data: \(error)")
            }
        }
        return .placeholder
    }
}

// MARK: - Timeline Entry
struct SimpleEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

extension WidgetData {
    static let placeholder = WidgetData(
        nextPrayerName: "Maghrib",
        nextPrayerTime: "19:40",
        prayerTimeLeft: "02:30",
        dailyQuote: "Indeed, with hardship [will be] ease.",
        dailyQuoteSource: "Quran 94:6",
        location: "Istanbul"
    )
}

// MARK: - Widget Views

// Small & Medium Widget (Prayer Focus)
struct ZikraWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        if family == .systemSmall {
            SmallView(data: entry.data)
        } else if family == .systemMedium {
            MediumView(data: entry.data)
        } else {
            SmallView(data: entry.data)
        }
    }
}

struct SmallView: View {
    let data: WidgetData
    
    var body: some View {
        ZStack {
            Color("WidgetBackground")
            VStack(alignment: .leading, spacing: 4) {
                Text(data.nextPrayerName)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.secondary)
                
                Text(data.nextPrayerTime)
                    .font(.system(size: 28, weight: .heavy, design: .rounded))
                    .foregroundColor(Color("WidgetPrimary"))
                
                Spacer()
                
                VStack(alignment: .leading, spacing: 0) {
                    Text("REMAINING")
                        .font(.system(size: 8))
                        .foregroundColor(.secondary)
                    Text(data.prayerTimeLeft)
                        .font(.caption2)
                        .fontWeight(.semibold)
                }
            }
            .padding()
        }
    }
}

struct MediumView: View {
    let data: WidgetData
    
    var body: some View {
        ZStack {
            Color("WidgetBackground")
            HStack {
                // Left: Prayer Info
                VStack(alignment: .leading, spacing: 6) {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(data.nextPrayerName.uppercased())
                            .font(.caption)
                            .fontWeight(.black)
                            .foregroundColor(Color("WidgetPrimary"))
                        Text(data.nextPrayerTime)
                            .font(.title)
                            .fontWeight(.heavy)
                    }
                    
                    Spacer()
                    
                    HStack {
                        Image(systemName: "mappin.circle.fill")
                            .font(.caption2)
                        Text(data.location)
                            .font(.caption2)
                    }
                    .foregroundColor(.secondary)
                }
                .frame(maxWidth: 100)
                
                Divider()
                    .padding(.vertical)
                
                // Right: Quote
                VStack(alignment: .leading, spacing: 6) {
                    Image(systemName: "quote.opening")
                        .foregroundColor(Color("WidgetPrimary").opacity(0.5))
                    Text(data.dailyQuote)
                        .font(.system(size: 13, weight: .regular, design: .serif))
                        .italic()
                        .lineLimit(3)
                        .fixedSize(horizontal: false, vertical: true)
                    
                    Spacer()
                    Text(data.dailyQuoteSource)
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
            }
            .padding()
        }
    }
}

// MARK: - Widget Configuration
struct ZikraWidget: Widget {
    let kind: String = "ZikraWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            ZikraWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Zikra Prayer & Quote")
        .description("Track prayer times and see daily inspiration.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct ZikraWidget_Previews: PreviewProvider {
    static var previews: some View {
        ZikraWidgetEntryView(entry: SimpleEntry(date: Date(), data: .placeholder))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
        
        ZikraWidgetEntryView(entry: SimpleEntry(date: Date(), data: .placeholder))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}
