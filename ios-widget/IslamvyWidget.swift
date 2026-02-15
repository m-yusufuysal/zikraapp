import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), prayerName: "Fajr", prayerTime: "05:30")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), prayerName: "Fajr", prayerTime: "05:30")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []
        
        // Load prayer times from SharedDefaults
        let sharedDefaults = UserDefaults(suiteName: "group.com.yusuf.islamvy")
        let prayerName = sharedDefaults?.string(forKey: "nextPrayerName") ?? "Prayer"
        let prayerTime = sharedDefaults?.string(forKey: "nextPrayerTime") ?? "--:--"
        
        let currentDate = Date()
        let entry = SimpleEntry(date: currentDate, prayerName: prayerName, prayerTime: prayerTime)
        entries.append(entry)

        // Update every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let prayerName: String
    let prayerTime: String
}

struct IslamvyWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "#1a365d"), Color(hex: "#2d4a6f")]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(spacing: 8) {
                Text("Next Prayer")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                
                Text(entry.prayerName)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text(entry.prayerTime)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(Color(hex: "#c9a227"))
                
                Image(systemName: "moon.stars.fill")
                    .foregroundColor(.white.opacity(0.6))
                    .font(.caption)
            }
            .padding()
        }
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

@main
struct IslamvyWidget: Widget {
    let kind: String = "IslamvyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            IslamvyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prayer Times")
        .description("Shows the next prayer time.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
